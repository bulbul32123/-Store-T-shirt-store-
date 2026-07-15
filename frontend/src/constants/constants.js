export const shopList = {
  title: "Shop All",
  lists: [
    {
      name: "All products",
      link: "/products",
    },
    {
      name: "Popular",
      link: "/products?status=popular",
    },
    {
      name: "New Drops",
      link: "/products?status=newDrop",
    },
  ],
};

export const status = {
  title: "Status",
  lists: [
    {
      name: "Featured",
      link: "/products?status=featured",
    },
    {
      name: "Sale",
      link: "/products?sale=true",
    },
    {
      name: "Free Shipping",
      link: "/products?freeShipping=true",
    },
    { name: "Best Selling", link: "/products?status=bestselling" },
  ],
};
