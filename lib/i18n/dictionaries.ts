import type { AppLocale } from "@/lib/i18n/config";

export type TranslationKey =
  | "brandName"
  | "nav.categories"
  | "nav.popular"
  | "nav.activities"
  | "nav.account"
  | "nav.signIn"
  | "nav.getStarted"
  | "common.contactWhatsapp"
  | "common.currency"
  | "checkout.paymentMethod"
  | "checkout.confirmAndPay"
  | "checkout.processing"
  | "payment.onlineCard"
  | "payment.onlineCardDescription"
  | "payment.cashOnSite"
  | "payment.cashOnSiteDescription"
  | "payment.partialPayment"
  | "payment.partialPaymentDescription";

const dictionaries: Record<AppLocale, Record<TranslationKey, string>> = {
  fr: { brandName: "FunBook Maroc", "nav.categories": "Catégories", "nav.popular": "Populaires", "nav.activities": "Activités", "nav.account": "Compte", "nav.signIn": "Se connecter", "nav.getStarted": "Commencer", "common.contactWhatsapp": "Contacter sur WhatsApp", "common.currency": "MAD", "checkout.paymentMethod": "Méthode de paiement", "checkout.confirmAndPay": "Confirmer et payer", "checkout.processing": "Traitement...", "payment.onlineCard": "Carte en ligne", "payment.onlineCardDescription": "Paiement carte sécurisé (intégration locale à venir).", "payment.cashOnSite": "Paiement sur place", "payment.cashOnSiteDescription": "Payez directement au prestataire au début de l'activité.", "payment.partialPayment": "Acompte / paiement partiel", "payment.partialPaymentDescription": "Réservez avec un acompte. Le reste sera payé sur place." },
  ar: { brandName: "فن بوك المغرب", "nav.categories": "الفئات", "nav.popular": "الأكثر شعبية", "nav.activities": "الأنشطة", "nav.account": "الحساب", "nav.signIn": "تسجيل الدخول", "nav.getStarted": "ابدأ الآن", "common.contactWhatsapp": "تواصل عبر واتساب", "common.currency": "درهم", "checkout.paymentMethod": "طريقة الدفع", "checkout.confirmAndPay": "تأكيد والدفع", "checkout.processing": "جارٍ المعالجة...", "payment.onlineCard": "بطاقة بنكية عبر الإنترنت", "payment.onlineCardDescription": "دفع إلكتروني آمن (تكامل محلي قريبًا).", "payment.cashOnSite": "الدفع في عين المكان", "payment.cashOnSiteDescription": "ادفع مباشرةً لمقدم الخدمة عند بدء النشاط.", "payment.partialPayment": "عربون / دفع جزئي", "payment.partialPaymentDescription": "احجز بعربون وادفع الباقي في عين المكان." },
  en: { brandName: "FunBook Morocco", "nav.categories": "Categories", "nav.popular": "Popular", "nav.activities": "Activities", "nav.account": "Account", "nav.signIn": "Sign in", "nav.getStarted": "Get started", "common.contactWhatsapp": "Contact on WhatsApp", "common.currency": "MAD", "checkout.paymentMethod": "Payment method", "checkout.confirmAndPay": "Confirm & pay", "checkout.processing": "Processing...", "payment.onlineCard": "Online card", "payment.onlineCardDescription": "Secure card payment placeholder for future local gateway integration.", "payment.cashOnSite": "Cash on site", "payment.cashOnSiteDescription": "Pay directly to the provider when the activity starts.", "payment.partialPayment": "Partial payment", "payment.partialPaymentDescription": "Book with a deposit now and pay the rest on site." },
};

export function getDictionary(locale: AppLocale) {
  return dictionaries[locale];
}
