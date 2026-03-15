import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import Ajv from "ajv";
import ajvErrors from "ajv-errors";

const ajv = new Ajv({ allErrors: true, jsonPointers: true });
ajvErrors(ajv);

const verseSchema = {
  type: "array",
  items: {
    type: "object",
    properties: {
      en: { type: "string" },
      ar: {
        type: "string",
        pattern: "^[\\u0600-\\u06FF\\u0750-\\u077F\\u08A0-\\u08FF\\s]+$",
      },
      ref: {
        type: "string",
        pattern: "^Quran \\d+:\\d+(?:-\\d+)?$",
      },
      sura: { type: "integer", minimum: 1, maximum: 114 },
      ayah: { type: "integer" },
    },
    required: ["en", "ar", "ref", "sura", "ayah"],
    additionalProperties: false,
    errorMessage: {
      type: "Each entry must be an object",
      required: {
        sura: "The 'sura' field is required and must be an integer.",
        en: "An English translation ('en') is required.",
      },
      properties: {
        sura: "Sura must be an integer between 1 and 114.",
        ayah: "Ayah must be a valid number.",
        ref: "The 'ref' field must follow the format 'Quran X:Y' or 'Quran X:Y-Z' (e.g., 'Quran 1:1' or 'Quran 94:5-6').",
        ar: "The 'ar' field must only contain Arabic characters and spaces.",
      },
    },
  },
};

const validate = ajv.compile(verseSchema);

const directories = ["src/app/data", "src/views"];
let hasError = false;

directories.forEach((dir) => {
  const files = readdirSync(dir).filter((f) => f.endsWith("verses.json"));
  files.forEach((file) => {
    const path = join(dir, file);
    try {
      const data = JSON.parse(readFileSync(path, "utf-8"));
      const valid = validate(data);
      if (!valid) throw new Error(ajv.errorsText(validate.errors));
      console.log(`✅ ${path} passed schema validation.`);
    } catch (e) {
      console.error(`❌ Validation failed for ${path}: ${e.message}`);
      hasError = true;
    }
  });
});

if (hasError) process.exit(1);
