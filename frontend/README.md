      
      
        Task:
         1. Remove all the trendding status from product create, edit to products page.
         2. Add Recommandation System from carts,watchlist,orders, search data
         3. Fix Admin's notification, Create,Delete,Edit Carsousels Data, Create,Delete,Edit Upcomming products add on banners,MegaMenu
         4. Search Result Page, Search Bar, Save Search data. and Watchlist page
         5. Email verification
         6. Language


Admin Sidebar layout:

├── DASHBOARD
│   └── Analytics
├── MANAGEMENT
│   ├── Orders (Active)
|   |--- Categories
│   ├── Products & Inventory
│   └── Customers
├── MARKETING
│   ├── COUPONS & DISCOUNTS
|       - Create coupons: code, type (% or flat), value, expiry date, usage limit, minimum order value
|       - Table: Code | Type | Value | Expiry | Used/Limit | Status | Actions
|       - Toggle coupon active/inactive
|
│   └── REVIEWS & RATINGS MANAGEMENT
|        - Table: Product | Customer | Rating (stars) | Review Text | Date | Status (Approved/Pending/Rejected)
|        - Admin can approve, reject, or delete reviews
|        - Filter by rating, product, status
|
└── SETTINGS
|


|---NOTIFICATIONS CENTER
| - In-app notification log: new orders, low stock alerts, new customer signups, new reviews
| - Mark as read / clear all
| - (Extendable: plug in email/SMS notification later)




└── 📁tshirt
    └── 📁backend
        └── 📁config
            ├── index.js
        └── 📁controllers
            ├── adminController.js
            ├── admincustomercontroller.js
            ├── adminOrderController.js
            ├── authController.js
            ├── categoryController.js
            ├── chatController.js
            ├── orderController.js
            ├── productController.js
            ├── uploadController.js
        └── 📁middleware
            ├── auth.js
            ├── authMiddleware.js
        └── 📁models
            ├── Category.js
            ├── Chat.js
            ├── Order.js
            ├── Product.js
            ├── User.js
        └── 📁routes
            ├── admin.js
            ├── auth.js
            ├── categories.js
            ├── chats.js
            ├── orders.js
            ├── productRoutes.js
            ├── products.js
            ├── upload.js
        └── 📁scripts
            ├── seedCustomers.js
            ├── seedFiveMockOrders.js
            ├── seedOrders.js
            ├── test-cloudinary.js
        └── 📁uploads
            ├── 52e5e6024567c2c2e98d3b116b4ffbf2
        └── 📁utils
            ├── cloudinary.js
            ├── email.js
            ├── errorHandler.js
            ├── imageConverter.js
            ├── slugGenerator.js
        ├── .env
        ├── .gitignore
        ├── package-lock.json
        ├── package.json
        ├── server.js
    └── 📁frontend
        └── 📁public
            └── 📁images
                ├── .DS_Store
                ├── user.jpeg
            └── 📁productImgs
                └── 📁product1
                    ├── .DS_Store
                    ├── black-t-shirt-1.avif
                    ├── black-t-shirt-2.avif
                    ├── black-t-shirt-3.avif
                    ├── black-t-shirt-4.avif
                    ├── black-t-shirt-5.avif
                    ├── black-t-shirt-6.avif
                    ├── img-1.jpg
                    ├── img-2.jpg
                    ├── img-3.jpg
                    ├── img-4.jpg
                    ├── orange-t-shirt-1.avif
                    ├── orange-t-shirt-2.avif
                    ├── orange-t-shirt-3.avif
                    ├── orange-t-shirt-4.avif
                    ├── orange-t-shirt-5.avif
                    ├── orange-t-shirt-6.avif
                    ├── white-t-shirt-1.avif
                    ├── white-t-shirt-2.avif
                    ├── white-t-shirt-3.avif
                    ├── white-t-shirt-4.avif
                    ├── white-t-shirt-5.avif
                    ├── white-t-shirt-6.avif
                └── 📁product2
                └── 📁product3
                └── 📁product4
                └── 📁product5
                ├── .DS_Store
            ├── .DS_Store
            ├── file.svg
            ├── globe.svg
            ├── next.svg
            ├── vercel.svg
            ├── window.svg
        └── 📁src
            └── 📁app
                └── 📁admin
                    └── 📁categories
                        ├── page.js
                    └── 📁customers
                        ├── page.jsx
                    └── 📁dashboard
                        └── 📁orders
                            ├── page.js
                        └── 📁users
                            ├── page.js
                        ├── page.js
                    └── 📁login
                        ├── page.js
                    └── 📁orders
                        ├── page.jsx
                    └── 📁products
                        └── 📁edit
                            └── 📁[id]
                                ├── page.js
                        └── 📁new
                            ├── page.js
                        ├── page.js
                    └── 📁profile
                        ├── page.js
                    ├── layout.js
                    ├── page.js
                └── 📁auth
                    └── 📁forgot-password
                        ├── page.js
                    └── 📁login
                        ├── page.js
                    └── 📁register
                        ├── page.js
                    └── 📁reset-password
                        └── 📁[token]
                            ├── page.js
                    └── 📁verify-email
                        └── 📁[token]
                            ├── page.js
                └── 📁bg-remover
                    ├── page.js
                └── 📁cart
                    ├── page.js
                └── 📁category
                    └── 📁[slug]
                        ├── page.js
                └── 📁customize
                └── 📁product
                    └── 📁[id]
                        ├── page.js
                └── 📁profile
                    ├── page.js
                ├── .DS_Store
                ├── favicon.ico
                ├── globals.css
                ├── layout.js
                ├── page.js
            └── 📁components
                └── 📁admin
                    └── 📁footer
                        ├── AdminFooter.js
                    └── 📁header
                        ├── NotificationDropdown.js
                        ├── UserDropdown.js
                    └── 📁search
                        ├── SearchBar.js
                    ├── AdminHeader.js
                    ├── AdminLayout.js
                    ├── AdminSidebar.js
                    ├── AdminStats.js
                    ├── CategoryForm.js
                    ├── CustomerDrawer.jsx
                    ├── CustomersTable.jsx
                    ├── FilterBar.jsx
                    ├── MetricsGrid.jsx
                    ├── ProductsPage.js
                    ├── ProductsTable.js
                └── 📁common
                    ├── Breadcrumb.js
                    ├── ConfirmModal.js
                    ├── LoadingSpinner.js
                    ├── Newsletter.js
                    ├── ThemeToggleButton.js
                └── 📁home
                    ├── Categories.js
                    ├── FeaturedProducts.js
                    ├── Hero.js
                    ├── PopularProducts.js
                    ├── TrendingProducts.js
                └── 📁layout
                    ├── AppLayer.js
                    ├── Footer.js
                    ├── Header.js
                └── 📁products
                    ├── DiscountedPrice.js
                    ├── ProductCard.js
                    ├── ProductReviews.js
                    ├── Quantity.js
                    ├── RelatedProducts.js
                    ├── SizeSelection.js
                └── 📁test
                    ├── FileUploadTest.js
                └── 📁ui
                    └── 📁dropdown
                        ├── Dropdown.js
                        ├── DropdownItem.js
                ├── BulkActionsBar.jsx
                ├── OrderDetailDrawer.jsx
                ├── OrderFiltersBar.jsx
                ├── OrderMetricsCards.jsx
                ├── OrdersTable.jsx
                ├── Pagination.jsx
                ├── StatusBadge.jsx
            └── 📁context
                ├── AuthContext.js
                ├── CartContext.js
                ├── SidebarContext.js
            └── 📁hooks
                ├── useBgRemover.js
                ├── useDebounce.js
                ├── useOrders.js
            └── 📁lib
                ├── adminOrdersApi.js
                ├── api.js
            └── 📁utils
                ├── api.js
                ├── config.js
                ├── formatters.js
                ├── formDataHelper.js
        ├── .env
```


