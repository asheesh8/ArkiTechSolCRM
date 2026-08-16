// Splitting a stereo WAV into one file per channel.
//
// Twilio's dual-channel recording puts each leg of the call on its own channel,
// which is the whole reason to ask for it: transcribe the channels separately
// and every line already knows who said it. No diarization model, no guessing
// at speaker turns. The only thing standing between the download and that
// result is de-interleaving PCM samples, which a WAV file makes simple enough
// to do here rather than shelling out to ffmpeg.

export class WavFormatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WavFormatError";
  }
}

export type WavInfo = {
  channels: number;
  sampleRate: number;
  bitsPerSample: number;
  /** Byte offset of the sample data within the source buffer. */
  dataStart: number;
  dataSize: number;
};

/**
 * Walk the RIFF chunk list looking for one id. Chunks are word-aligned, so an
 * odd-sized chunk is followed by a pad byte that is not counted in its size —
 * miss that and every chunk after the first odd one is read at the wrong offset.
 */
function findChunk(buffer: Buffer, id: string) {
  let offset = 12; // Past "RIFF", the file size, and "WAVE".

  while (offset + 8 <= buffer.length) {
    const chunkId = buffer.toString("ascii", offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    if (chunkId === id) return { start: offset + 8, size };
    offset += 8 + size + (size % 2);
  }

  return null;
}

export function readWavInfo(buffer: Buffer): WavInfo {
  if (buffer.length < 12 || buffer.toString("ascii", 0, 4) !== "RIFF" || buffer.toString("ascii", 8, 12) !== "WAVE") {
    throw new WavFormatError("That download isn't a WAV file.");
  }

  const fmt = findChunk(buffer, "fmt ");
  if (!fmt || fmt.size < 16) throw new WavFormatError("The WAV file has no format header.");

  const audioFormat = buffer.readUInt16LE(fmt.start);
  const channels = buffer.readUInt16LE(fmt.start + 2);
  const sampleRate = buffer.readUInt32LE(fmt.start + 4);
  const bitsPerSample = buffer.readUInt16LE(fmt.start + 14);

  // 1 is uncompressed PCM, which is what Twilio serves for a `.wav` recording.
  if (audioFormat !== 1) {
    throw new WavFormatError(`Expected uncompressed PCM audio, got format ${audioFormat}.`);
  }
  if (bitsPerSample % 8 !== 0 || bitsPerSample === 0) {
    throw new WavFormatError(`Unsupported sample width: ${bitsPerSample} bits.`);
  }

  const data = findChunk(buffer, "data");
  if (!data) throw new WavFormatError("The WAV file has no audio data.");

  // A recording still being written can declare a larger data chunk than it
  // actually contains; trust the bytes that are really there.
  const dataSize = Math.min(data.size, buffer.length - data.start);

  return { channels, sampleRate, bitsPerSample, dataStart: data.start, dataSize };
}

function monoHeader(dataLength: number, sampleRate: number, bitsPerSample: number) {
  const bytesPerSample = bitsPerSample / 8;
  const header = Buffer.alloc(44);

  header.write("RIFF", 0, "ascii");
  header.writeUInt32LE(36 + dataLength, 4);
  header.write("WAVE", 8, "ascii");
  header.write("fmt ", 12, "ascii");
  header.writeUInt32LE(16, 16); // PCM format chunks are 16 bytes.
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // one channel
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * bytesPerSample, 28); // byte rate
  header.writeUInt16LE(bytesPerSample, 32); // block align
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36, "ascii");
  header.writeUInt32LE(dataLength, 40);

  return header;
}

/**
 * One playable mono WAV per channel, in channel order. A mono source comes back
 * as a single-entry array so callers don't need a special case for it.
 */
export function splitWavChannels(buffer: Buffer): Buffer[] {
  const info = readWavInfo(buffer);
  const bytesPerSample = info.bitsPerSample / 8;
  const frameSize = info.channels * bytesPerSample;
  const frames = Math.floor(info.dataSize / frameSize);

  if (frames === 0) throw new WavFormatError("The recording contains no audio.");
  if (info.channels === 1) return [buffer];

  const bodies = Array.from({ length: info.channels }, () => Buffer.alloc(frames * bytesPerSample));

  for (let frame = 0; frame < frames; frame += 1) {
    const readAt = info.dataStart + frame * frameSize;
    const writeAt = frame * bytesPerSample;
    for (let channel = 0; channel < info.channels; channel += 1) {
      const channelAt = readAt + channel * bytesPerSample;
      for (let byte = 0; byte < bytesPerSample; byte += 1) {
        bodies[channel][writeAt + byte] = buffer[channelAt + byte];
      }
    }
  }

  return bodies.map((body) =>
    Buffer.concat([monoHeader(body.length, info.sampleRate, info.bitsPerSample), body]),
  );
}
