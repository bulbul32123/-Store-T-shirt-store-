import { FiUsers, FiShoppingBag, FiDollarSign, FiBox } from 'react-icons/fi';

const AdminStats = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: <FiDollarSign className="h-8 w-8 text-green-500" />,
      change: stats.revenueChange,
      changeText: 'vs last month',
      changeColor: stats.revenueChange >= 0 ? 'text-green-500' : 'text-red-500'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: <FiShoppingBag className="h-8 w-8 text-blue-500" />,
      change: stats.ordersChange,
      changeText: 'vs last month',
      changeColor: stats.ordersChange >= 0 ? 'text-green-500' : 'text-red-500'
    },
    {
      title: 'Total Customers',
      value: stats.totalCustomers,
      icon: <FiUsers className="h-8 w-8 text-purple-500" />,
      change: stats.customersChange,
      changeText: 'vs last month',
      changeColor: stats.customersChange >= 0 ? 'text-green-500' : 'text-red-500'
    },
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: <FiBox className="h-8 w-8 text-orange-500" />,
      change: null,
      changeText: '',
      changeColor: ''
    }
  ];
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map(card => (
        <div key={card.title} className="bg-white p-6 rounded-lg shadow flex items-start justify-between">
          <div>
            <p className="text-gray-500 text-sm">{card.title}</p>
            <p className="text-2xl font-bold mt-1 text-black ">{card.value}</p>
            {card.change !== null && (
              <p className={`text-sm mt-1 ${card.changeColor}`}>
                {card.change >= 0 ? '+' : ''}{card.change}% {card.changeText}
              </p>
            )}
          </div>
          <div className="p-3 rounded-full bg-gray-100">
            {card.icon}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminStats; 