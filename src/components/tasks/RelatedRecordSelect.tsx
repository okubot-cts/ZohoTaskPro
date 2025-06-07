import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, Search } from 'lucide-react';
import { RelatedRecord } from '../../types';

interface RelatedRecordSelectProps {
  value?: RelatedRecord;
  onChange: (record: RelatedRecord | null) => void;
}

// Mock data for demonstration
const MOCK_RECORDS: RelatedRecord[] = [
  { id: 'deal1', name: 'Acme Corp Deal', type: 'Deal', amount: 10000, stage: 'Negotiation' },
  { id: 'deal2', name: 'Globex Project', type: 'Deal', amount: 25000, stage: 'Proposal' },
  { id: 'contact1', name: 'John Smith', type: 'Contact' },
  { id: 'contact2', name: 'Jane Doe', type: 'Contact' },
  { id: 'account1', name: 'Microsoft', type: 'Account' },
  { id: 'lead1', name: 'Sarah Johnson', type: 'Lead' },
];

export const RelatedRecordSelect: React.FC<RelatedRecordSelectProps> = ({ value, onChange }: RelatedRecordSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [isOpen]);

  const filteredRecords = MOCK_RECORDS.filter(record =>
    record.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.type.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleSelect = (record: RelatedRecord | null) => {
    onChange(record);
    setIsOpen(false);
    setSearchQuery('');
  };
  
  if (typeof document === 'undefined') {
    return null; // For server-side rendering or environments without document
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        className="inline-flex items-center justify-between w-full rounded-md border border-gray-300 shadow-sm px-2 py-1 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        {value ? (
          <>
            <span className="truncate">
              {value.name}
              <span className="ml-1 text-xs text-gray-500">({value.type})</span>
            </span>
            {value.amount && (
              <span className="ml-1 text-xs text-gray-500">
                ${value.amount.toLocaleString()}
              </span>
            )}
          </>
        ) : (
          <span className="text-gray-400">Select record</span>
        )}
        <ChevronDown className="ml-2 h-4 w-4 text-gray-400" />
      </button>

      {isOpen && createPortal(
        <div className="z-50 rounded-md bg-white shadow-lg" style={dropdownStyle}>
          <div className="p-2">
            <div className="relative">
              <input
                type="text"
                className="block w-full rounded-md border border-gray-300 pl-8 pr-3 py-1.5 text-sm"
                placeholder="Search records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
          
          <ul className="max-h-60 overflow-auto py-1">
            {value && (
              <li>
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
                  onClick={() => handleSelect(null)}
                >
                  Clear selection
                </button>
              </li>
            )}
            
            {filteredRecords.map((record) => (
              <li key={record.id}>
                <button
                  type="button"
                  className={`w-full text-left px-3 py-2 text-sm ${
                    value?.id === record.id
                      ? 'bg-primary-50 text-primary-900'
                      : 'text-gray-900 hover:bg-gray-100'
                  }`}
                  onClick={() => handleSelect(record)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{record.name}</span>
                      <span className="ml-1 text-xs text-gray-500">({record.type})</span>
                      {record.stage && (
                        <span className="ml-1 text-xs text-gray-500">{record.stage}</span>
                      )}
                    </div>
                    {value?.id === record.id && (
                      <Check className="h-4 w-4 text-primary-600" />
                    )}
                  </div>
                  {record.amount && (
                    <div className="text-xs text-gray-500">
                      ${record.amount.toLocaleString()}
                    </div>
                  )}
                </button>
              </li>
            ))}
            
            {filteredRecords.length === 0 && (
              <li className="px-3 py-2 text-sm text-gray-500 text-center">
                No records found
              </li>
            )}
          </ul>
        </div>, document.body
      )}
    </div>
  );
};