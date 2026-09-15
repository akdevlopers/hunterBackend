export const THEMES_LIST = [
  {
    id: "stylique",
    name: "Stylique",
    description: "Modern fashion & lifestyle luxury eCommerce store layout.",
    category: "Fashion & Apparel",
    thumbnail: "/themes/stylique/preview.png",
    fallbackColor: "from-purple-600 to-indigo-700",
    tags: ["Fashion", "Modern", "Grid"],
    version: "2.4.0",
    isDefault: true,
  },
  {
    id: "greentic",
    name: "Greentic",
    description: "Organic, wellness, and eco-friendly clean eCommerce aesthetic.",
    category: "Organic & Grocery",
    thumbnail: "/themes/greentic/preview.png",
    fallbackColor: "from-emerald-600 to-teal-700",
    tags: ["Eco", "Organic", "Minimal"],
    version: "1.8.2",
    isDefault: false,
  },
  {
    id: "techzonix",
    name: "Techzonix",
    description: "High-tech electronics, digital devices, and gadget store design.",
    category: "Electronics & Gadgets",
    thumbnail: "/themes/techzonix/preview.png",
    fallbackColor: "from-blue-600 to-cyan-700",
    tags: ["Tech", "Electronics", "Dark Modern"],
    version: "2.1.0",
    isDefault: false,
  },
];

export const THEME_PAGES = {
  stylique: [
    { title: "Header", slug: "header", detail: "Header settings such as site top bar, logo, and navigation.", icon: "LayoutTemplate" },
    { title: "Home Page", slug: "home", detail: "Home page sections, sliders, hero banners, and featured categories.", icon: "Home", is_order: true, orders: "slider,category,product,top_category,bestseller,more_offer,article,testimonial,logos" },
    { title: "Footer", slug: "footer", detail: "Footer settings such as copyright, links, payment icons, and social icons.", icon: "Footprints" },
    { title: "About Us", slug: "abouts-us", detail: "Company profile, team story, and value propositions.", icon: "BookOpen" },
    { title: "Contact Us", slug: "contact-us", detail: "Contact information, map coordinate details, and form fields.", icon: "PhoneCall" },
    { title: "Blog Page", slug: "blog", detail: "Articles feed, sidebar tags, and category widgets.", icon: "FileText" },
    { title: "Article Page", slug: "article", detail: "Single blog article layout, author bio, and related posts.", icon: "Newspaper" },
    { title: "Cart Page", slug: "cart", detail: "Shopping bag settings, free delivery thresholds, and promo banner.", icon: "ShoppingCart" },
    { title: "Checkout Page", slug: "checkout", detail: "Checkout step settings, order summary, and payment badges.", icon: "CreditCard" },
    { title: "FAQs", slug: "faqs", detail: "Frequently asked questions and accordion topics.", icon: "HelpCircle" },
    { title: "Product Detail", slug: "product", detail: "Product page options, review widgets, and variant layout.", icon: "Package" },
    { title: "Track Order", slug: "track-order", detail: "Live shipment tracking visual steps and instructions.", icon: "Truck" },
    { title: "Wishlist", slug: "wishlist", detail: "Saved items collection and quick add-to-cart actions.", icon: "Heart" },
  ],
  greentic: [
    { title: "Header", slug: "header", detail: "Header bar, fresh produce categories, and search bar.", icon: "LayoutTemplate" },
    { title: "Home Page", slug: "home", detail: "Fresh banner sliders, seasonal crops, organic collections.", icon: "Home", is_order: true, orders: "slider,category,product,bestseller,more_offer,article,logos" },
    { title: "Footer", slug: "footer", detail: "Eco badge footer, newsletter subscription, and organic certs.", icon: "Footprints" },
    { title: "About Us", slug: "abouts-us", detail: "Our farm & sustainability manifesto.", icon: "BookOpen" },
    { title: "Contact Us", slug: "contact-us", detail: "Store branch locators and organic customer care.", icon: "PhoneCall" },
    { title: "Cart Page", slug: "cart", detail: "Fresh basket and express delivery estimator.", icon: "ShoppingCart" },
    { title: "Checkout Page", slug: "checkout", detail: "Eco-friendly packaging preferences and payment options.", icon: "CreditCard" },
  ],
  techzonix: [
    { title: "Header", slug: "header", detail: "Mega menu, tech category dropdown, and specs comparison link.", icon: "LayoutTemplate" },
    { title: "Home Page", slug: "home", detail: "Flash deals slider, gadget carousels, and specs comparison.", icon: "Home", is_order: true, orders: "slider,top_category,product,bestseller,more_offer,testimonial,logos" },
    { title: "Footer", slug: "footer", detail: "Tech specs guarantee, RMA policy, and warranty badges.", icon: "Footprints" },
    { title: "About Us", slug: "abouts-us", detail: "Our technology innovation journey.", icon: "BookOpen" },
    { title: "Contact Us", slug: "contact-us", detail: "Technical support ticket links and service centers.", icon: "PhoneCall" },
    { title: "Product Detail", slug: "product", detail: "Full technical datasheet and 360 degree product view.", icon: "Package" },
  ],
};

export const THEME_SECTION_SCHEMAS = {
  stylique: {
    header: {
      title: "Header Settings",
      slug: "header",
      detail: "Configure site top bar, branding logo, navigation menu, and search behavior.",
      sections: [
        {
          title: "Menu Bar",
          slug: "menu_bar",
          key: "menu_bar",
          settings: [
            { label: "Enable Menu Bar", key: "status", type: "switch", value: 1 },
            { label: "Active Main Menu", key: "menu", type: "menu", placeholder: "Select navigation menu", value: "Primary Header Nav" },
            { label: "Sticky Navigation", key: "sticky", type: "switch", value: 1 },
          ],
        },
        {
          title: "Brand Logo & Favicon",
          slug: "logo",
          key: "header",
          settings: [
            { label: "Display Logo", key: "status", type: "switch", value: 1 },
            { label: "Main Brand Logo", key: "logo", type: "image", value: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=300&auto=format&fit=crop&q=60" },
            { label: "Browser Favicon", key: "favicon", type: "image", value: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=60" },
            { label: "Logo Height (px)", key: "logo_height", type: "text", value: "42", placeholder: "e.g. 42" },
          ],
        },
        {
          title: "Search Bar & Quick Actions",
          slug: "search",
          key: "header_search",
          settings: [
            { label: "Enable Search Bar", key: "status", type: "switch", value: 1 },
            { label: "Search Placeholder Text", key: "title", type: "text", value: "Search high fashion clothing, luxury accessories...", placeholder: "Enter placeholder text..." },
            { label: "Enable Login / Account Icon", key: "login_status", type: "switch", value: 1 },
            { label: "Enable Wishlist Quick Access", key: "wishlist_status", type: "switch", value: 1 },
            { label: "Enable Mini Cart Drawer", key: "cart_status", type: "switch", value: 1 },
          ],
        },
        {
          title: "Announcement Top Bar",
          slug: "announcement",
          key: "top_bar",
          settings: [
            { label: "Show Announcement Bar", key: "status", type: "switch", value: 1 },
            { label: "Announcement Text", key: "text", type: "text", value: "✨ Autumn Collection 2026 Live: Get 25% Off with code STYLIQUE25 | Free Global Delivery", placeholder: "Announcement text..." },
            { label: "Bar Background Color", key: "bg_color", type: "text", value: "#1e1b4b", placeholder: "e.g. #1e1b4b" },
            { label: "Bar Text Color", key: "text_color", type: "text", value: "#f5f3ff", placeholder: "e.g. #ffffff" },
          ],
        },
      ],
    },
    home: {
      title: "Home Page Settings",
      slug: "home",
      detail: "Customize sliders, promotional banners, featured collections, and testimonial sections.",
      sections: [
        {
          title: "Main Hero Slider",
          slug: "slider",
          key: "slider",
          settings: [
            { label: "Enable Slider", key: "status", type: "switch", value: 1 },
            {
              label: "Slides List",
              key: "repeater",
              type: "slider",
              fields: ["image", "big_text", "content", "button_text", "button_link"],
              value: [
                {
                  image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&auto=format&fit=crop&q=80",
                  big_text: "Elevate Your Signature Style",
                  content: "Discover the latest haute couture & timeless runway pieces handcrafted for modern sophistication.",
                  button_text: "Shop Collection",
                  button_link: "/collections/autumn-2026",
                },
                {
                  image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&auto=format&fit=crop&q=80",
                  big_text: "Unleash Your Runway Potential",
                  content: "Explore our curated international designer edits designed to empower your everyday presence.",
                  button_text: "Explore Lookbook",
                  button_link: "/collections/runway",
                },
              ],
            },
          ],
        },
        {
          title: "Promotional Banner / More Offer",
          slug: "more_offer",
          key: "more_offer",
          settings: [
            { label: "Show Offer Banner", key: "status", type: "switch", value: 1 },
            { label: "Offer Banner Image", key: "image", type: "image", value: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&auto=format&fit=crop&q=80" },
            { label: "Headline Text", key: "headline", type: "text", value: "Mid-Season Private Sale • Up to 40% Off Select Apparel", placeholder: "Headline..." },
            { label: "Button Target Link", key: "button_link", type: "text", value: "/sale", placeholder: "https://... or /path" },
          ],
        },
        {
          title: "Brand Partner Logos",
          slug: "logos",
          key: "logo",
          settings: [
            { label: "Show Brand Carousel", key: "status", type: "switch", value: 1 },
            {
              label: "Partner Logos",
              key: "repeater",
              type: "slider",
              fields: ["image", "brand_name"],
              value: [
                { image: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&auto=format&fit=crop&q=60", brand_name: "Armani Exchange" },
                { image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=60", brand_name: "Gucci Luxe" },
                { image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=200&auto=format&fit=crop&q=60", brand_name: "Prada Milano" },
                { image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=200&auto=format&fit=crop&q=60", brand_name: "Chanel Paris" },
              ],
            },
          ],
        },
        {
          title: "Featured Categories Grid",
          slug: "category",
          key: "category",
          settings: [
            { label: "Display Category Section", key: "status", type: "switch", value: 1 },
            { label: "Section Title", key: "title", type: "text", value: "Curated Style Categories", placeholder: "Section title..." },
            { label: "Section Subtitle", key: "subtitle", type: "textarea", value: "Discover the freshest luxury garments tailored for this season's palette." },
            { label: "Items per Row", key: "columns", type: "text", value: "4", placeholder: "4" },
          ],
        },
      ],
    },
    footer: {
      title: "Footer Settings",
      slug: "footer",
      detail: "Configure footer menus, copyright notice, payment provider badges, and social media handles.",
      sections: [
        {
          title: "Footer Brand & Bio",
          slug: "brand_info",
          key: "footer_brand",
          settings: [
            { label: "Display Footer Brand", key: "status", type: "switch", value: 1 },
            { label: "Footer Logo", key: "logo", type: "image", value: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=300&auto=format&fit=crop&q=60" },
            { label: "Brand Summary", key: "description", type: "textarea", value: "Meetay Stylique is the definitive luxury eCommerce experience designed for high-performing modern fashion brands." },
            { label: "Copyright Notice", key: "copyright", type: "text", value: "© 2026 Meetay Technologies Inc. All Rights Reserved.", placeholder: "Copyright notice" },
          ],
        },
        {
          title: "Newsletter Subscription Bar",
          slug: "newsletter",
          key: "footer_newsletter",
          settings: [
            { label: "Enable Newsletter", key: "status", type: "switch", value: 1 },
            { label: "Headline", key: "title", type: "text", value: "Join The Meetay VIP Inner Circle", placeholder: "Headline..." },
            { label: "Subtext", key: "subtext", type: "text", value: "Receive confidential previews, private trunk show invites, and 15% off your first checkout.", placeholder: "Subtext..." },
          ],
        },
      ],
    },
  },
};
