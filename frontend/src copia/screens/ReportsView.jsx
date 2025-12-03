import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import './AdminScreen.css'; 

const ReportsView = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("accessToken");
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  };

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/orders/api/dashboard/', getAuthHeaders());
        setData(response.data);
      } catch (error) {
        console.error("Error reportes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) return <div style={{padding:'2rem'}}>Cargando...</div>;
  if (!data) return <div style={{padding:'2rem'}}>Sin datos. Corre la simulación.</div>;

  return (
    <div className="reports-container" style={{ padding: '2rem' }}>
      <h2 style={{ marginBottom: '2rem' }}>Reporte de Ventas</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #dee2e6' }}>
          <h3>Ingresos Totales</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#E67E22' }}>
            ${parseFloat(data.summary.revenue).toLocaleString()}
          </p>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #dee2e6' }}>
          <h3>Órdenes</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{data.summary.orders}</p>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #dee2e6' }}>
          <h3>Top Producto</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2ecc71' }}>
            {data.top_products[0]?.producto__nombre || "N/A"}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', height: '350px' }}>
          <h4>Tendencia de Órdenes</h4>
          <ResponsiveContainer>
            <LineChart data={data.timeline}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="orders_count" stroke="#E67E22" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', height: '350px' }}>
          <h4>Más Vendidos</h4>
          <ResponsiveContainer>
            <BarChart data={data.top_products} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="producto__nombre" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="total_sold" fill="#3498db" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ReportsView;