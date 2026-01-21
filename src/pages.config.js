import Home from './pages/Home';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Contact from './pages/Contact';
import Accessibility from './pages/Accessibility';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "PrivacyPolicy": PrivacyPolicy,
    "TermsOfService": TermsOfService,
    "Contact": Contact,
    "Accessibility": Accessibility,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};