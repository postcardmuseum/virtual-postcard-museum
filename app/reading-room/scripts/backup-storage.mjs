import { createClient } from "@supabase/supabase-js";
import nextEnv from "@next/env";
const { loadEnvConfig } = nextEnv;
import fs from "fs";
import path from "path";

loadEnvConfig(process.cwd());

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Supabase URL or key was not found in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const BUCKET = "postcard-images";

const backupFolder = path.join(
  process.cwd(),
  "postcard-storage-backup"
);

async function getAllFiles(folder = "") {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .list(folder, {
      limit: 1000,
      sortBy: { column: "name", order: "asc" },
    });

  if (error) {
    throw error;
  }

  let files = [];

  for (const item of data) {
    const itemPath = folder
      ? `${folder}/${item.name}`
      : item.name;

    // Files have an id. Folders do not.
    if (item.id) {
      files.push(itemPath);
    } else {
      const subFiles = await getAllFiles(itemPath);
      files = files.concat(subFiles);
    }
  }

  return files;
}

async function downloadFile(filePath) {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .download(filePath);

  if (error) {
    console.error(`❌ Could not download: ${filePath}`);
    console.error(error.message);
    return;
  }

  const destination = path.join(
    backupFolder,
    filePath
  );

  fs.mkdirSync(path.dirname(destination), {
    recursive: true,
  });

  const arrayBuffer = await data.arrayBuffer();

  fs.writeFileSync(
    destination,
    Buffer.from(arrayBuffer)
  );

  console.log(`✅ Backed up: ${filePath}`);
}

async function runBackup() {
  console.log("");
  console.log("====================================");
  console.log(" Virtual Postcard Museum Backup");
  console.log("====================================");
  console.log("");
  console.log(`Bucket: ${BUCKET}`);
  console.log("Finding postcard images...");
  console.log("");

  fs.mkdirSync(backupFolder, {
    recursive: true,
  });

  const files = await getAllFiles("2026");

  console.log(`Found ${files.length} files.`);
  console.log("");

  if (files.length === 0) {
    console.log("No files were found.");
    return;
  }

  for (let i = 0; i < files.length; i++) {
    console.log(
      `[${i + 1} of ${files.length}] ${files[i]}`
    );

    await downloadFile(files[i]);
  }

  console.log("");
  console.log("====================================");
  console.log("✅ BACKUP COMPLETE");
  console.log("====================================");
  console.log("");
  console.log(`Backup saved to:`);
  console.log(backupFolder);
  console.log("");
}

runBackup().catch((error) => {
  console.error("");
  console.error("❌ Backup failed:");
  console.error(error);
  process.exit(1);
});