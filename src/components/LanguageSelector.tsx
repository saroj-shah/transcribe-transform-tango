
import { motion } from "framer-motion";

interface Language {
  code: string;
  name: string;
}

const languages: Language[] = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "nl", name: "Dutch" },
  { code: "pl", name: "Polish" },
  { code: "ru", name: "Russian" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "zh", name: "Chinese" },
];

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageSelect: (code: string) => void;
  label?: string;
}

const LanguageSelector = ({
  selectedLanguage,
  onLanguageSelect,
  label = "Select Language",
}: LanguageSelectorProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-xs"
    >
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <select
        value={selectedLanguage}
        onChange={(e) => onLanguageSelect(e.target.value)}
        className="w-full px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
        <option value="">Select a language</option>
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </motion.div>
  );
};

export default LanguageSelector;
