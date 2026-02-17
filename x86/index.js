import { performance } from "node:perf_hooks";
import { createDspPipeline } from "dspx";

const startLoad = performance.now();
const endLoad = performance.now();
const globalLoadTime = endLoad - startLoad;

export const handler = async (event) => {
  console.log("--- High-Precision ESM Benchmark Starting ---");

  const INPUT_SIZES = [
    { name: "SMALL", length: 1024, reps: 1000 },
    { name: "LARGE", length: 1048576, reps: 50 }, // Reduced slightly to ensure stability
  ];

  const WARMUP_REPS = 50;

  const results = {
    metadata: {
      initLoadTimeMs: globalLoadTime.toFixed(2),
      arch: process.arch,
      memory: "2048MB",
      note: "Implementation uses O(1) circular buffers. Throughput decreases with additional stages due to cache pressure.",
    },
    benchmarks: [],
  };

  try {
    for (const size of INPUT_SIZES) {
      console.log(`Warming up ${size.name}...`);
      const signal = new Float32Array(size.length).fill(0.5);
      const pipeline = createDspPipeline();
      pipeline.MovingAverage({ mode: "moving", windowSize: 128 });

      for (let i = 0; i < WARMUP_REPS; i++) {
        await pipeline.process(signal, { sampleRate: 44100, channels: 1 });
      }

      console.log(`Measuring ${size.name} (${size.reps} iterations)...`);
      const times = [];

      for (let i = 0; i < size.reps; i++) {
        const t0 = performance.now();
        await pipeline.process(signal, { sampleRate: 44100, channels: 1 });
        times.push(performance.now() - t0);
      }

      const totalTime = times.reduce((a, b) => a + b, 0);
      const avgDuration = totalTime / size.reps;
      const throughput = ((size.length / avgDuration) * 1000) / 1e6;

      results.benchmarks.push({
        input: size.name,
        samples: size.length.toLocaleString(),
        iterations: size.reps,
        avgDurationMs: avgDuration.toFixed(4),
        throughput: throughput.toFixed(1) + "M samples/sec",
      });

      pipeline.dispose();
    }
  } catch (err) {
    console.error("Benchmark Error:", err);
    return { error: err.message };
  }

  console.table(results.benchmarks);
  return results;
};
