// frontend/src/hooks/useApi.js
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  dashboardService, 
  inventoryService, 
  productService, 
  salesService,
  customerService,
  orderService,
  reportService
} from '../services/api';

// Hooks para Dashboard
export const useDashboardStats = (period) => {
  return useQuery(
    ['dashboardStats', period], 
    () => dashboardService.getStats(period).then(res => res.data),
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000, // 5 minutos
    }
  );
};

export const useDashboardWithDateRange = (from, to) => {
  return useQuery(
    ['dashboardStats', from, to], 
    () => dashboardService.getStatsWithRange(from, to).then(res => res.data),
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000,
      enabled: !!from && !!to, // Solo ejecutar si hay fechas
    }
  );
};

// Hooks para Inventario
export const useInventory = () => {
  return useQuery(
    'inventory',
    () => inventoryService.getAll().then(res => res.data)
  );
};

export const useInventoryDetails = () => {
  return useQuery(
    'inventoryDetails',
    () => inventoryService.getDetails().then(res => res.data)
  );
};

export const useAddInventory = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    // Pasar directamente el número al servicio, no el objeto completo
    (registro) => inventoryService.add(registro),
    {
      onSuccess: () => {
        // Invalidar las consultas relacionadas para forzar recarga
        queryClient.invalidateQueries('inventory');
        queryClient.invalidateQueries('inventoryDetails');
      }
    }
  );
};


export const useUpdateInventory = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ ticket, telefono }) => inventoryService.update(ticket, telefono),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('inventoryDetails');
      }
    }
  );
};

export const useDeleteInventory = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (ticket) => inventoryService.remove(ticket),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('inventory');
        queryClient.invalidateQueries('inventoryDetails');
      }
    }
  );
};

// Hooks para Productos
export const useProducts = (from, to) => {
  return useQuery(
    ['products', from, to],
    () => productService.getAll(from, to).then(res => res.data),
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000,
      enabled: !!from && !!to, // Solo ejecutar si hay fechas
    }
  );
};

// Hooks para Ventas y Reportes
export const useSalesOverview = () => {
  return useQuery(
    'salesOverview',
    () => salesService.getOverview().then(res => res.data)
  );
};

export const useCategoryDistribution = (from, to) => {
  return useQuery(
    ['categoryDistribution', from, to],
    () => salesService.getCategoryDistribution(from, to).then(res => res.data),
    {
      keepPreviousData: true,
      enabled: !!from && !!to,
    }
  );
};

export const useDailyReport = (date) => {
  return useQuery(
    ['dailyReport', date],
    () => reportService.getDailyReport(date).then(res => res.data),
    {
      enabled: !!date,
    }
  );
};

// Hooks para Clientes
export const useCustomerSearch = (query) => {
  return useQuery(
    ['customers', query],
    () => customerService.searchByName(query).then(res => res.data),
    {
      enabled: !!query && query.length >= 2, // Solo buscar si hay al menos 2 caracteres
      keepPreviousData: true,
    }
  );
};

// Hooks para Órdenes
export const useOrderByTicket = (ticket) => {
  return useQuery(
    ['order', ticket],
    () => orderService.getByTicket(ticket).then(res => res.data),
    {
      enabled: !!ticket,
    }
  );
};

export const useOrdersByCustomer = (customerId) => {
  return useQuery(
    ['customerOrders', customerId],
    () => orderService.getByCustomer(customerId).then(res => res.data),
    {
      enabled: !!customerId,
    }
  );
};

export const useAllOrders = () => {
  return useQuery(
    'allOrders',
    () => orderService.getAll().then(res => res.data)
  );
};