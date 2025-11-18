export function calculateTSS(activity) {
  const {
    duration,
    averageHeartRate,
    maxHeartRate,
    averagePower,
    normalizedPower,
  } = activity;

  if (averagePower && normalizedPower) {
    const FTP = 250;
    const IF = normalizedPower / FTP;
    return ((duration * normalizedPower * IF) / (FTP * 3600)) * 100;
  }

  if (averageHeartRate && maxHeartRate) {
    const hrRatio = averageHeartRate / maxHeartRate;
    const intensityFactor = Math.pow(hrRatio, 3);
    return (duration / 3600) * intensityFactor * 100;
  }

  return (duration / 3600) * 50;
}

export function calculateNormalizedPower(powerStream) {
  if (!powerStream || powerStream.length === 0) return null;

  const rollingAvg = [];
  for (let i = 0; i < powerStream.length; i++) {
    const start = Math.max(0, i - 30);
    const slice = powerStream.slice(start, i + 1);
    const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
    rollingAvg.push(avg);
  }

  const powered = rollingAvg.map((p) => Math.pow(p, 4));
  const avgPowered = powered.reduce((a, b) => a + b, 0) / powered.length;
  return Math.pow(avgPowered, 0.25);
}

export function calculateCTL(tssHistory) {
  const timeConstant = 42;
  let ctl = 0;

  tssHistory.forEach((tss) => {
    ctl = ctl + (tss - ctl) / timeConstant;
  });

  return ctl;
}

export function calculateATL(tssHistory) {
  const timeConstant = 7;
  let atl = 0;

  tssHistory.forEach((tss) => {
    atl = atl + (tss - atl) / timeConstant;
  });

  return atl;
}

export function calculateTSB(ctl, atl) {
  return ctl - atl;
}

export function calculateBestEfforts(
  stream,
  durations = [5, 30, 60, 120, 300, 600, 1200, 3600],
) {
  if (!stream || stream.length === 0) return {};

  const results = {};

  durations.forEach((duration) => {
    let maxAvg = 0;

    for (let i = 0; i <= stream.length - duration; i++) {
      const slice = stream.slice(i, i + duration);
      const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
      maxAvg = Math.max(maxAvg, avg);
    }

    results[`sec${duration}`] = maxAvg;
  });

  return results;
}

export function kmeans(data, k = 5, maxIterations = 100) {
  const n = data.length;
  const dim = data[0].length;

  let centroids = [];
  const used = new Set();
  while (centroids.length < k) {
    const idx = Math.floor(Math.random() * n);
    if (!used.has(idx)) {
      centroids.push([...data[idx]]);
      used.add(idx);
    }
  }

  let assignments = new Array(n).fill(0);

  for (let iter = 0; iter < maxIterations; iter++) {
    let changed = false;
    for (let i = 0; i < n; i++) {
      let minDist = Infinity;
      let bestCluster = 0;

      for (let j = 0; j < k; j++) {
        const dist = euclideanDistance(data[i], centroids[j]);
        if (dist < minDist) {
          minDist = dist;
          bestCluster = j;
        }
      }

      if (assignments[i] !== bestCluster) {
        assignments[i] = bestCluster;
        changed = true;
      }
    }

    if (!changed) break;

    const newCentroids = Array.from({ length: k }, () =>
      new Array(dim).fill(0),
    );
    const counts = new Array(k).fill(0);

    for (let i = 0; i < n; i++) {
      const cluster = assignments[i];
      for (let d = 0; d < dim; d++) {
        newCentroids[cluster][d] += data[i][d];
      }
      counts[cluster]++;
    }

    for (let j = 0; j < k; j++) {
      if (counts[j] > 0) {
        for (let d = 0; d < dim; d++) {
          centroids[j][d] = newCentroids[j][d] / counts[j];
        }
      }
    }
  }

  return { assignments, centroids };
}

export function pca2D(data) {
  const n = data.length;
  const dim = data[0].length;

  const means = new Array(dim).fill(0);
  for (let i = 0; i < n; i++) {
    for (let d = 0; d < dim; d++) {
      means[d] += data[i][d];
    }
  }
  for (let d = 0; d < dim; d++) {
    means[d] /= n;
  }

  const centered = data.map((point) => point.map((val, d) => val - means[d]));

  const cov = Array.from({ length: dim }, () => new Array(dim).fill(0));
  for (let i = 0; i < n; i++) {
    for (let d1 = 0; d1 < dim; d1++) {
      for (let d2 = 0; d2 < dim; d2++) {
        cov[d1][d2] += centered[i][d1] * centered[i][d2];
      }
    }
  }
  for (let d1 = 0; d1 < dim; d1++) {
    for (let d2 = 0; d2 < dim; d2++) {
      cov[d1][d2] /= n;
    }
  }

  const projected = centered.map((point) => [point[0], point[1]]);

  return projected;
}

function euclideanDistance(a, b) {
  return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0));
}
