'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from '@/contexts/LocaleContext';
import { Button } from './Button';
import { Modal } from './Modal';
import { Languages, Check } from 'lucide-react';
import { type Locale, locales } from '@/i18n/config';

const localeNames: Record<Locale, string> = {
  ja: '日本語',
  en: 'English',
};

const localeFlags: Record<Locale, string> = {
  ja: '🇯🇵',
  en: '🇺🇸',
};

export function LanguageSwitcher() {
  const t = useTranslations('common');
  const { locale, setLocale } = useLocale();
  const [isOpen, setIsOpen] = useState(false);

  const handleLocaleChange = (newLocale: Locale) => {
    setLocale(newLocale);
    setIsOpen(false);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        leftIcon={<Languages className="h-4 w-4" />}
        aria-label={t('language')}
      >
        <span className="hidden sm:inline">{localeNames[locale]}</span>
        <span className="sm:hidden">{localeFlags[locale]}</span>
      </Button>

      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">{t('language')}</h2>
          <div className="space-y-2">
            {locales.map((loc) => (
              <button
                key={loc}
                onClick={() => handleLocaleChange(loc)}
                className={`
                  flex w-full items-center justify-between rounded-lg px-4 py-3 text-left transition-colors
                  ${
                    locale === loc
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{localeFlags[loc]}</span>
                  <span className="font-medium">{localeNames[loc]}</span>
                </div>
                {locale === loc && (
                  <Check className="h-5 w-5 text-primary" />
                )}
              </button>
            ))}
          </div>
        </div>
      </Modal>
    </>
  );
}