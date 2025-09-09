import { promises as fs } from "fs";
import * as path from "path";

export async function removeFilesSafe(
  filenames: string[] = [],
  baseDir: string
) {
  const results = await Promise.allSettled(
    filenames.map((name) => {
      const filePath = path.join(baseDir, path.basename(name));
      return fs.unlink(filePath);
    })
  );

  const summary = {
    deleted: 0,
    missing: 0,
    failed: 0,
    errors: [] as string[],
  };

  results.forEach((r, i) => {
    if (r.status === "fulfilled") summary.deleted++;
    else {
      const err: NodeJS.ErrnoException = r.reason;
      if (err?.code === "ENOENT") summary.missing++;
      else {
        summary.failed++;
        summary.errors.push(`${filenames[i]} -> ${err?.message}`);
      }
    }
  });

  return summary;
}
