import React from 'react';
import promotionData from '../data/promotionData.json';

const PromoScreen = () => {
  const plans = promotionData.data.promotionPlans;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Promotion Plans</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map(plan => (
          <div key={plan.id} className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-semibold">{plan.name}</h2>
            <p className="text-sm text-gray-600 mb-2">{plan.description}</p>
            <div className="mt-2 mb-4">
              <p><strong>Type:</strong> {plan.type}</p>
              <p><strong>Duration:</strong> {plan.duration} days</p>
              <p><strong>Price:</strong> GHS {plan.price}</p>
              <p>
                <strong>Status:</strong>{' '}
                <span className={plan.isActive ? 'text-green-600' : 'text-red-600'}>
                  {plan.isActive ? 'Active' : 'Inactive'}
                </span>
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Features</h3>
              <ul className="text-sm list-disc list-inside">
                {Object.entries(plan.features).map(([key, value]) => (
                  <li key={key} className={value ? 'text-green-600' : 'text-gray-400'}>
                    {key} {value ? '✔️' : '❌'}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-4 flex justify-between">
              <button className="text-sm text-blue-600 hover:underline">Edit</button>
              <button className="text-sm text-red-600 hover:underline">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PromoScreen;
