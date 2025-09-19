import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Article, Customer, Invoice, StockMovement } from '../types/index';
import { ApiDataService } from '../services/ApiDataService';

interface WarenwirtschaftState {
  articles: Article[];
  customers: Customer[];
  invoices: Invoice[];
  stockMovements: StockMovement[];
  selectedRow: string | null;
}

type WarenwirtschaftAction =
  | { type: 'SET_ARTICLES'; payload: Article[] }
  | { type: 'ADD_ARTICLE'; payload: Article }
  | { type: 'UPDATE_ARTICLE'; payload: Article }
  | { type: 'DELETE_ARTICLE'; payload: string }
  | { type: 'SET_CUSTOMERS'; payload: Customer[] }
  | { type: 'ADD_CUSTOMER'; payload: Customer }
  | { type: 'UPDATE_CUSTOMER'; payload: Customer }
  | { type: 'DELETE_CUSTOMER'; payload: string }
  | { type: 'SET_INVOICES'; payload: Invoice[] }
  | { type: 'SET_STOCK_MOVEMENTS'; payload: StockMovement[] }
  | { type: 'SELECT_ROW'; payload: string | null };

interface WarenwirtschaftContextType {
  state: WarenwirtschaftState;
  dispatch: React.Dispatch<WarenwirtschaftAction>;
  dataService: ApiDataService;
}

const WarenwirtschaftContext = createContext<WarenwirtschaftContextType | undefined>(undefined);

const initialState: WarenwirtschaftState = {
  articles: [],
  customers: [],
  invoices: [],
  stockMovements: [],
  selectedRow: null,
};

function warenwirtschaftReducer(state: WarenwirtschaftState, action: WarenwirtschaftAction): WarenwirtschaftState {
  switch (action.type) {
    case 'SET_ARTICLES':
      return { ...state, articles: action.payload };
    case 'ADD_ARTICLE':
      return { ...state, articles: [...state.articles, action.payload] };
    case 'UPDATE_ARTICLE':
      return {
        ...state,
        articles: state.articles.map(article =>
          article.id === action.payload.id ? action.payload : article
        ),
      };
    case 'DELETE_ARTICLE':
      return {
        ...state,
        articles: state.articles.filter(article => article.id !== action.payload),
      };
    case 'SET_CUSTOMERS':
      return { ...state, customers: action.payload };
    case 'ADD_CUSTOMER':
      return { ...state, customers: [...state.customers, action.payload] };
    case 'UPDATE_CUSTOMER':
      return {
        ...state,
        customers: state.customers.map(customer =>
          customer.id === action.payload.id ? action.payload : customer
        ),
      };
    case 'DELETE_CUSTOMER':
      return {
        ...state,
        customers: state.customers.filter(customer => customer.id !== action.payload),
      };
    case 'SET_INVOICES':
      return { ...state, invoices: action.payload };
    case 'SET_STOCK_MOVEMENTS':
      return { ...state, stockMovements: action.payload };
    case 'SELECT_ROW':
      return { ...state, selectedRow: action.payload };
    default:
      return state;
  }
}

export const WarenwirtschaftProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(warenwirtschaftReducer, initialState);
  const dataService = new ApiDataService();

  // Initialize data on mount
  React.useEffect(() => {
    const loadData = async () => {
      try {
        // Check if API is available
        const isHealthy = await dataService.checkHealth();
        if (!isHealthy) {
          console.error('API server is not available');
          return;
        }

        dispatch({ type: 'SET_ARTICLES', payload: await dataService.getArticles() });
        dispatch({ type: 'SET_CUSTOMERS', payload: await dataService.getCustomers() });
        dispatch({ type: 'SET_INVOICES', payload: dataService.getInvoices() });
        dispatch({ type: 'SET_STOCK_MOVEMENTS', payload: dataService.getStockMovements() });
      } catch (error) {
        console.error('Failed to load data from API:', error);
      }
    };
    loadData();
  }, []);

  return (
    <WarenwirtschaftContext.Provider value={{ state, dispatch, dataService }}>
      {children}
    </WarenwirtschaftContext.Provider>
  );
};

export const useWarenwirtschaft = () => {
  const context = useContext(WarenwirtschaftContext);
  if (context === undefined) {
    throw new Error('useWarenwirtschaft must be used within a WarenwirtschaftProvider');
  }
  return context;
};