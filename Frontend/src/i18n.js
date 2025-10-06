import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resource files loaded here or via backend
const resources = {
  en: { translation: { welcome: "Welcome to Healthcare AI", select_language: "Please select your preferred language:", voice_input: "Voice Input (Coming Soon)" }},
  'zh-CN': { translation: { welcome: "欢迎使用医疗AI", select_language: "[translate:请选择您偏好的语言：]", voice_input: "[translate:语音输入（敬请期待）]" }},
  'zh-HK': { translation: { welcome: "歡迎使用醫療AI", select_language: "[translate:請選擇您偏好的語言：]", voice_input: "[translate:語音輸入（敬請期待）]" }},
};

i18n
  .use(LanguageDetector) 
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;
