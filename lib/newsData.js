export const newsItems = [
  {
    id: 1,
    title: "New Tournament Season Announced",
    excerpt:
      "Get ready for the most exciting tournament season yet with new prizes and game modes.",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula.",
    date: "2025-10-20",
    author: "Admin",
    category: "Tournaments",
    image: "/assets/tournament.jpg",
    featured: true,
  },
  {
    id: 2,
    title: "Pro Player Spotlight: Interview with Champion",
    excerpt:
      "We sat down with last season's champion to discuss their journey to the top.",
    content:
      "Sed auctor neque eu tellus rhoncus ut eleifend nibh porttitor. Ut in nulla enim. Phasellus molestie magna non est bibendum non venenatis nisl tempor.",
    date: "2025-10-18",
    author: "Editor",
    category: "Interviews",
    image: "/assets/interview.jpg",
    featured: false,
  },
  {
    id: 3,
    title: "Game Update: New Maps and Features",
    excerpt:
      "The latest game update brings exciting new maps and gameplay features.",
    content:
      "Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget.",
    date: "2025-10-15",
    author: "Dev Team",
    category: "Updates",
    image: "/assets/update.jpg",
    featured: false,
  },
  {
    id: 4,
    title: "Community Event: Charity Gaming Marathon",
    excerpt:
      "Join us for a 24-hour gaming marathon to raise money for charity.",
    content:
      "Aenean ultricies mi vitae est. Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra.",
    date: "2025-10-12",
    author: "Community Manager",
    category: "Events",
    image: "/assets/charity.jpg",
    featured: false,
  },
  {
    id: 5,
    title: "Strategy Guide: Mastering the Meta",
    excerpt:
      "Our experts break down the current meta and share tips to improve your gameplay.",
    content:
      "Vestibulum erat wisi, condimentum sed, commodo vitae, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt condimentum.",
    date: "2025-10-10",
    author: "Pro Player",
    category: "Guides",
    image: "/assets/strategy.jpg",
    featured: false,
  },
];

export const getNewsItemById = (id) =>
  newsItems.find((item) => String(item.id) === String(id));
