// LanguageSelector.js
const LanguageSelector = ({ onSelect }) => {
  const languages = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Spanish' },
    { code: 'fr', label: 'French' },
    { code: 'hi', label: 'Hindi' },
    // add more as needed
  ];

  return (
   <select
      onChange={(e) => onSelect(e.target.value)}
      className="border rounded p-2 mb-2 w-64"
    >
      <option value="">Select Language</option>
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.label}
        </option>
      ))}
    </select>
  );
};

export default LanguageSelector;
