import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  // Typically corresponds to the `[locale]` segment
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: {
      home: {
        ...(await import(`../messages/home/${locale}.json`)).default,
        about: (await import(`../messages/home/About/${locale}.json`)).default,
        contact: (await import(`../messages/home/ContactUs/${locale}.json`)).default,
      },
      header: (await import(`../messages/header/${locale}.json`)).default,
      community: {
        ...(await import(`../messages/community/${locale}.json`)).default,
        discussion: (await import(`../messages/community/Discussion/${locale}.json`)).default,
      },
      extra: {
        CreateAccountRedirect: (await import(`../messages/extra/CreateAccountRedirect/${locale}.json`)).default,
        EnablePermission: (await import(`../messages/extra/EnablePermission/${locale}.json`)).default,
        NotificationPanel: (await import(`../messages/extra/NotificationPanel/${locale}.json`)).default,
        RedirectNotAccount: (await import(`../messages/extra/RedirectNotAccount/${locale}.json`)).default,
        SignUpPopUp: (await import(`../messages/extra/SignUpPopUp/${locale}.json`)).default,
      },
      faq: (await import(`../messages/home/FAQ/${locale}.json`)).default,
      footer: (await import(`../messages/footer/${locale}.json`)).default,
      marketplace: {
        Marketplace: (await import(`../messages/marketplace/Marketplace/${locale}.json`)).default,
        CartDrawer: (await import(`../messages/marketplace/CartDrawer/${locale}.json`)).default,
        FlotingCart: (await import(`../messages/marketplace/FlotingCart/${locale}.json`)).default,
        NegotiationPanel: (await import(`../messages/marketplace/NegotiationPanel/${locale}.json`)).default,
        Singlemarketplace: (await import(`../messages/marketplace/Singlemarketplace/${locale}.json`)).default,
      },
      profile: {
        buyer: {
          CreateAccount: (await import(`../messages/profile/buyer/CreateAccount/${locale}.json`)).default,
          Negotiation: (await import(`../messages/profile/buyer/Negotiation/${locale}.json`)).default,
          MyPurchases: (await import(`../messages/profile/buyer/MyPurchases/${locale}.json`)).default,
          Profile: (await import(`../messages/profile/buyer/Profile/${locale}.json`)).default,
          SinglePurchase: (await import(`../messages/profile/buyer/SinglePurchase/${locale}.json`)).default,
        },
        farmer: {
          Analytics: (await import(`../messages/profile/farmer/Analytics/${locale}.json`)).default,
          CreateAccount: (await import(`../messages/profile/farmer/CreateAccount/${locale}.json`)).default,
          Negotiation: (await import(`../messages/profile/farmer/Negotiation/${locale}.json`)).default,
          Orders: (await import(`../messages/profile/farmer/Orders/${locale}.json`)).default,
          Profile: (await import(`../messages/profile/farmer/Profile/${locale}.json`)).default,
          SingleOrder: (await import(`../messages/profile/farmer/SingleOrder/${locale}.json`)).default,
          
        },
      },
      
      waste:(await import(`../messages/waste/listWaste/${locale}.json`)).default,
      myListing:(await import(`../messages/waste/listing/${locale}.json`)).default,
      process:(await import(`../messages/waste/process/${locale}.json`)).default,
      wasteCommon:(await import(`../messages/waste/common/${locale}.json`)).default,

    },
  };
});
