import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { USSDCode, TransactionTypeConfig } from '../types';
import { Plus, Edit2, Trash2, Save, X, Settings as SettingsIcon, Code, Smartphone } from 'lucide-react';

export const Settings: React.FC = () => {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState<'transaction_types' | 'ussd_codes'>('transaction_types');
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [editingConfig, setEditingConfig] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<Partial<USSDCode>>({});
  const [configFormData, setConfigFormData] = useState<Partial<TransactionTypeConfig>>({});

  const handleSaveUSSD = () => {
    if (editingCode) {
      dispatch({
        type: 'UPDATE_USSD_CODE',
        payload: { id: editingCode, updates: formData }
      });
      setEditingCode(null);
    } else {
      const newCode: USSDCode = {
        id: Date.now().toString(),
        name: formData.name || '',
        code: formData.code || '',
        description: formData.description || '',
        network: formData.network || 'MTN',
        category: formData.category || 'custom_ussd',
        isActive: formData.isActive ?? true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      dispatch({ type: 'ADD_USSD_CODE', payload: newCode });
      setShowAddForm(false);
    }
    setFormData({});
  };

  const handleSaveConfig = () => {
    if (editingConfig && configFormData) {
      dispatch({
        type: 'UPDATE_TRANSACTION_TYPE_CONFIG',
        payload: { id: editingConfig, updates: configFormData }
      });
      setEditingConfig(null);
      setConfigFormData({});
    }
  };

  const handleEditUSSD = (code: USSDCode) => {
    setEditingCode(code.id);
    setFormData(code);
  };

  const handleEditConfig = (config: TransactionTypeConfig) => {
    setEditingConfig(config.id);
    setConfigFormData(config);
  };

  const handleDeleteUSSD = (id: string) => {
    if (confirm('Are you sure you want to delete this USSD code?')) {
      dispatch({ type: 'DELETE_USSD_CODE', payload: id });
    }
  };

  const handleCancel = () => {
    setEditingCode(null);
    setEditingConfig(null);
    setShowAddForm(false);
    setFormData({});
    setConfigFormData({});
  };

  const formatTransactionType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="px-4 py-6 pb-24 max-w-md mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <SettingsIcon className="w-6 h-6 text-gray-600" />
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-md mb-6 border border-gray-100">
        <div className="flex">
          <button
            onClick={() => setActiveTab('transaction_types')}
            className={`flex-1 py-3 px-4 text-sm font-medium rounded-l-xl transition-colors ${
              activeTab === 'transaction_types'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:text-blue-600'
            }`}
          >
            <Smartphone className="w-4 h-4 inline mr-2" />
            Transaction Types
          </button>
          <button
            onClick={() => setActiveTab('ussd_codes')}
            className={`flex-1 py-3 px-4 text-sm font-medium rounded-r-xl transition-colors ${
              activeTab === 'ussd_codes'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:text-blue-600'
            }`}
          >
            <Code className="w-4 h-4 inline mr-2" />
            USSD Codes
          </button>
        </div>
      </div>

      {/* Transaction Types Tab */}
      {activeTab === 'transaction_types' && (
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Configure Network USSD Codes</h3>
            <p className="text-sm text-blue-700">
              Set up USSD codes for each transaction type across different networks. Use {'{amount}'} and {'{phone}'} as placeholders.
            </p>
          </div>

          {state.transactionTypeConfigs.map((config) => (
            <div key={config.id} className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              {editingConfig === config.id ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Edit {formatTransactionType(config.type)}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`config-active-${config.id}`}
                        checked={configFormData.isActive ?? true}
                        onChange={(e) => setConfigFormData({ ...configFormData, isActive: e.target.checked })}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor={`config-active-${config.id}`} className="text-sm font-medium text-gray-700">
                        Active
                      </label>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {['MTN', 'VODAFONE', 'AIRTELTIGO', 'UNIVERSAL'].map((network) => (
                      <div key={network}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {network} USSD Code:
                        </label>
                        <input
                          type="text"
                          value={configFormData.networks?.[network as keyof typeof configFormData.networks] || ''}
                          onChange={(e) => setConfigFormData({
                            ...configFormData,
                            networks: {
                              ...configFormData.networks,
                              [network]: e.target.value
                            }
                          })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                          placeholder={`*123*{amount}*{phone}#`}
                          inputMode="text"
                          pattern="[0-9*#{}a-zA-Z_]*"
                        />
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex space-x-4 pt-4">
                    <button
                      onClick={handleSaveConfig}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {formatTransactionType(config.type)}
                      </h3>
                      <p className="text-sm text-gray-500">Configure USSD codes for all networks</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        config.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {config.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <button
                        onClick={() => handleEditConfig(config)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    {Object.entries(config.networks).map(([network, code]) => (
                      code && (
                        <div key={network} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium text-gray-700">{network}:</span>
                          <span className="text-sm text-gray-600 font-mono">{code}</span>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* USSD Codes Tab */}
      {activeTab === 'ussd_codes' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Custom USSD Codes</h2>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Code</span>
            </button>
          </div>

          {/* Add Form */}
          {showAddForm && (
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h3 className="text-lg font-semibold mb-4">Add New USSD Code</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Name (e.g., MTN Balance Check)"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="USSD Code (e.g., *170*7#)"
                  value={formData.code || ''}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                  inputMode="text"
                  pattern="[0-9*#{}a-zA-Z_]*"
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="grid grid-cols-2 gap-4">
                  <select
                    value={formData.network || 'MTN'}
                    onChange={(e) => setFormData({ ...formData, network: e.target.value as any })}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="MTN">MTN</option>
                    <option value="VODAFONE">Vodafone</option>
                    <option value="AIRTELTIGO">AirtelTigo</option>
                    <option value="UNIVERSAL">Universal</option>
                  </select>
                  <select
                    value={formData.category || 'custom_ussd'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="custom_ussd">Custom USSD</option>
                    <option value="cash_in">Cash In</option>
                    <option value="cash_out">Cash Out</option>
                    <option value="airtime_transfer">Airtime Transfer</option>
                    <option value="pay_merchant">Pay Merchant</option>
                    <option value="commission">Commission</option>
                    <option value="balance">Balance</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive ?? true}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                    Active
                  </label>
                </div>
              </div>
              <div className="flex space-x-4 mt-6">
                <button
                  onClick={handleSaveUSSD}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          )}

          {/* USSD Codes List */}
          <div className="space-y-4">
            {state.ussdCodes.map((code) => (
              <div key={code.id} className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                {editingCode === code.id ? (
                  <div className="space-y-4">
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        value={formData.code || ''}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                        inputMode="text"
                        pattern="[0-9*#{}a-zA-Z_]*"
                      />
                      <input
                        type="text"
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <select
                          value={formData.network || 'MTN'}
                          onChange={(e) => setFormData({ ...formData, network: e.target.value as any })}
                          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="MTN">MTN</option>
                          <option value="VODAFONE">Vodafone</option>
                          <option value="AIRTELTIGO">AirtelTigo</option>
                          <option value="UNIVERSAL">Universal</option>
                        </select>
                        <select
                          value={formData.category || 'custom_ussd'}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="custom_ussd">Custom USSD</option>
                          <option value="cash_in">Cash In</option>
                          <option value="cash_out">Cash Out</option>
                          <option value="airtime_transfer">Airtime Transfer</option>
                          <option value="pay_merchant">Pay Merchant</option>
                          <option value="commission">Commission</option>
                          <option value="balance">Balance</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`active-${code.id}`}
                        checked={formData.isActive ?? true}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor={`active-${code.id}`} className="text-sm font-medium text-gray-700">
                        Active
                      </label>
                    </div>
                    <div className="flex space-x-4">
                      <button
                        onClick={handleSaveUSSD}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save</span>
                      </button>
                      <button
                        onClick={handleCancel}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{code.name}</h3>
                        <p className="text-sm text-gray-500">{code.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          code.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {code.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <button
                          onClick={() => handleEditUSSD(code)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUSSD(code.id)}
                          className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">Code:</span>
                        <span className="text-sm text-gray-600 font-mono">{code.code}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">Network:</span>
                        <span className="text-sm text-gray-600">{code.network}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">Category:</span>
                        <span className="text-sm text-gray-600">{formatTransactionType(code.category || 'custom_ussd')}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};