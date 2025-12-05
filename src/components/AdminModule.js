import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import html2canvas from 'html2canvas';
import API_URL from '../config';

const COLORS = ['#89CFF0', '#A8D8B9', '#FFD54F', '#FF8A80', '#B39DDB', '#81C784', '#64B5F6', '#FFB74D'];

function AdminModule() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    ageGroup: '',
    placeOfLiving: ''
  });
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const params = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.ageGroup) params.ageGroup = filters.ageGroup;
      if (filters.placeOfLiving) params.placeOfLiving = filters.placeOfLiving;

      const response = await axios.get(`${API_URL}/api/admin/analytics`, { params });
      setAnalytics(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setMessage({ type: 'error', text: 'Failed to load analytics' });
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    setLoading(true);
    fetchAnalytics();
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      ageGroup: '',
      placeOfLiving: ''
    });
    setTimeout(() => {
      setLoading(true);
      fetchAnalytics();
    }, 100);
  };

  const exportData = async (format) => {
    try {
      const params = { format };
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.ageGroup) params.ageGroup = filters.ageGroup;
      if (filters.placeOfLiving) params.placeOfLiving = filters.placeOfLiving;

      if (format === 'csv') {
        const response = await axios.get(`${API_URL}/api/admin/submissions`, {
          params,
          responseType: 'blob'
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'meai_responses.csv');
        document.body.appendChild(link);
        link.click();
        link.remove();

        setMessage({ type: 'success', text: 'CSV exported successfully!' });
      } else if (format === 'json') {
        const response = await axios.get(`${API_URL}/api/admin/submissions`, { params });

        const dataStr = JSON.stringify(response.data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const link = document.createElement('a');
        link.setAttribute('href', dataUri);
        link.setAttribute('download', 'meai_responses.json');
        link.click();

        setMessage({ type: 'success', text: 'JSON exported successfully!' });
      }
    } catch (error) {
      console.error('Export error:', error);
      setMessage({ type: 'error', text: 'Failed to export data' });
    }
  };

  const downloadChart = async (elementId, filename) => {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        setMessage({ type: 'error', text: 'Chart not found' });
        return;
      }

      const canvas = await html2canvas(element, {
        backgroundColor: '#FAFCFF',
        scale: 2
      });

      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = canvas.toDataURL();
      link.click();

      setMessage({ type: 'success', text: 'Chart downloaded successfully!' });
    } catch (error) {
      console.error('Download error:', error);
      setMessage({ type: 'error', text: 'Failed to download chart' });
    }
  };

  if (loading) {
    return (
      <div className="wide-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="wide-container">
        <div className="message message-error">
          Unable to load analytics data.
        </div>
      </div>
    );
  }

  // Prepare chart data
  const ageGroupData = Object.entries(analytics.summary.ageGroupCounts).map(([age, count]) => ({
    name: age,
    value: count,
    percentage: analytics.summary.totalSubmissions > 0 
      ? ((count / analytics.summary.totalSubmissions) * 100).toFixed(1) 
      : 0
  }));

  const placeData = Object.entries(analytics.summary.placeCounts).map(([place, count]) => ({
    name: place,
    value: count,
    percentage: analytics.summary.totalSubmissions > 0 
      ? ((count / analytics.summary.totalSubmissions) * 100).toFixed(1) 
      : 0
  }));

  return (
    <div className="wide-container">
      <h1 style={{ marginBottom: 'var(--spacing-lg)' }}>Analytics Dashboard</h1>

      {message && (
        <div className={`message message-${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Filters */}
      <div className="card mb-xl">
        <h3>🔍 Filters</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-md)' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: '0.9rem', fontWeight: 500 }}>
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: '0.9rem', fontWeight: 500 }}>
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: '0.9rem', fontWeight: 500 }}>
              Age Group
            </label>
            <select
              value={filters.ageGroup}
              onChange={(e) => handleFilterChange('ageGroup', e.target.value)}
            >
              <option value="">All Ages</option>
              <option value="13-17">13-17</option>
              <option value="18-24">18-24</option>
              <option value="25-34">25-34</option>
              <option value="35-44">35-44</option>
              <option value="45-50">45-50</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: '0.9rem', fontWeight: 500 }}>
              Place of Living
            </label>
            <select
              value={filters.placeOfLiving}
              onChange={(e) => handleFilterChange('placeOfLiving', e.target.value)}
            >
              <option value="">All Places</option>
              <option value="Urban">Urban</option>
              <option value="Rural">Rural</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-md)' }}>
          <button className="btn-primary" onClick={applyFilters}>
            Apply Filters
          </button>
          <button className="btn-secondary" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>
      </div>

      {/* Export Options */}
      <div className="card mb-xl">
        <h3>💾 Export Data</h3>
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-md)' }}>
          <button className="btn-primary" onClick={() => exportData('csv')}>
            📊 Export CSV
          </button>
          <button className="btn-primary" onClick={() => exportData('json')}>
            📄 Export JSON
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid mb-xl">
        <div className="stat-card">
          <div className="stat-value">{analytics.summary.totalSubmissions}</div>
          <div className="stat-label">Total Submissions</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{analytics.summary.avgCompletionTime}s</div>
          <div className="stat-label">Avg. Completion Time</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{analytics.summary.requiredCompletionRate.toFixed(1)}%</div>
          <div className="stat-label">Required Field Completion</div>
        </div>
      </div>

      {/* Demographics Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: 'var(--spacing-xl)', marginBottom: 'var(--spacing-xl)' }}>
        {/* Age Group Distribution */}
        <div className="card" id="age-chart">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
            <h3>Age Group Distribution</h3>
            <button 
              className="btn-small btn-secondary"
              onClick={() => downloadChart('age-chart', 'age-distribution')}
            >
              📥 Download
            </button>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={ageGroupData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {ageGroupData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          <div style={{ marginTop: 'var(--spacing-md)' }}>
            {ageGroupData.map((item, index) => (
              <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--spacing-xs) 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                  <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: COLORS[index % COLORS.length] }}></div>
                  {item.name}
                </span>
                <span style={{ fontWeight: 600 }}>{item.value} ({item.percentage}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Place Distribution */}
        <div className="card" id="place-chart">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
            <h3>Place of Living Distribution</h3>
            <button 
              className="btn-small btn-secondary"
              onClick={() => downloadChart('place-chart', 'place-distribution')}
            >
              📥 Download
            </button>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={placeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#A8D8B9" />
            </BarChart>
          </ResponsiveContainer>

          <div style={{ marginTop: 'var(--spacing-md)' }}>
            {placeData.map((item) => (
              <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--spacing-xs) 0', borderBottom: '1px solid var(--border)' }}>
                <span>{item.name}</span>
                <span style={{ fontWeight: 600 }}>{item.value} ({item.percentage}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Question Distributions */}
      <div className="card mb-xl">
        <h3>📊 Question Response Distributions</h3>

        {analytics.questionDistributions.map((qd, qIndex) => {
          if (['short-text', 'long-text', 'date'].includes(qd.questionType)) {
            return (
              <div key={qd.questionId} style={{ marginTop: 'var(--spacing-lg)', padding: 'var(--spacing-md)', background: 'var(--background)', borderRadius: 'var(--radius-md)' }}>
                <h4>{qd.questionText}</h4>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Type: {qd.questionType} • {qd.totalAnswers} responses
                </p>
              </div>
            );
          }

          const chartData = Object.entries(qd.distribution).map(([answer, data]) => ({
            name: answer,
            count: data.count,
            percentage: data.percentage.toFixed(1)
          }));

          return (
            <div key={qd.questionId} style={{ marginTop: 'var(--spacing-lg)', padding: 'var(--spacing-md)', background: 'var(--background)', borderRadius: 'var(--radius-md)' }} id={`question-${qIndex}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
                <h4>{qd.questionText}</h4>
                <button 
                  className="btn-small btn-secondary"
                  onClick={() => downloadChart(`question-${qIndex}`, `question-${qIndex + 1}`)}
                >
                  📥 Download
                </button>
              </div>

              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#89CFF0" />
                </BarChart>
              </ResponsiveContainer>

              <div style={{ marginTop: 'var(--spacing-md)' }}>
                {chartData.map((item, index) => (
                  <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--spacing-xs) 0', borderBottom: '1px solid var(--border)' }}>
                    <span>{item.name}</span>
                    <span style={{ fontWeight: 600 }}>{item.count} ({item.percentage}%)</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Age Group Breakdown */}
      <div className="card mb-xl">
        <h3>🎯 Breakdown by Age Group</h3>
        <div style={{ overflowX: 'auto', marginTop: 'var(--spacing-md)' }}>
          {Object.entries(analytics.ageGroupBreakdown).map(([age, questions]) => (
            <div key={age} style={{ marginBottom: 'var(--spacing-lg)' }}>
              <h4 style={{ color: 'var(--primary-soft)' }}>{age} years</h4>
              {Object.entries(questions).map(([questionId, answers]) => {
                const question = analytics.questionDistributions.find(q => q.questionId === questionId);
                if (!question || Object.keys(answers).length === 0) return null;

                return (
                  <div key={questionId} style={{ marginTop: 'var(--spacing-sm)', padding: 'var(--spacing-sm)', background: 'var(--background)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 500, marginBottom: 'var(--spacing-xs)' }}>
                      {question.questionText}
                    </div>
                    {Object.entries(answers).map(([answer, count]) => (
                      <div key={answer} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '2px 0' }}>
                        <span>{answer}</span>
                        <span style={{ fontWeight: 600 }}>{count}</span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Place Breakdown */}
      <div className="card mb-xl">
        <h3>🏘️ Breakdown by Place of Living</h3>
        <div style={{ overflowX: 'auto', marginTop: 'var(--spacing-md)' }}>
          {Object.entries(analytics.placeBreakdown).map(([place, questions]) => (
            <div key={place} style={{ marginBottom: 'var(--spacing-lg)' }}>
              <h4 style={{ color: 'var(--secondary-soft)' }}>{place}</h4>
              {Object.entries(questions).map(([questionId, answers]) => {
                const question = analytics.questionDistributions.find(q => q.questionId === questionId);
                if (!question || Object.keys(answers).length === 0) return null;

                return (
                  <div key={questionId} style={{ marginTop: 'var(--spacing-sm)', padding: 'var(--spacing-sm)', background: 'var(--background)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 500, marginBottom: 'var(--spacing-xs)' }}>
                      {question.questionText}
                    </div>
                    {Object.entries(answers).map(([answer, count]) => (
                      <div key={answer} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '2px 0' }}>
                        <span>{answer}</span>
                        <span style={{ fontWeight: 600 }}>{count}</span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Age × Place Pivot */}
      <div className="card mb-xl" id="pivot-heatmap">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
          <h3>🔥 Age × Place × Answer Heatmap</h3>
          <button 
            className="btn-small btn-secondary"
            onClick={() => downloadChart('pivot-heatmap', 'age-place-heatmap')}
          >
            📥 Download
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: 'var(--primary-lighter)' }}>
                <th style={{ padding: 'var(--spacing-sm)', border: '1px solid var(--border)', textAlign: 'left' }}>Age Group</th>
                <th style={{ padding: 'var(--spacing-sm)', border: '1px solid var(--border)', textAlign: 'left' }}>Place</th>
                <th style={{ padding: 'var(--spacing-sm)', border: '1px solid var(--border)', textAlign: 'left' }}>Responses</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(analytics.pivot).map(([age, places]) =>
                Object.entries(places).map(([place, questions]) => {
                  const totalResponses = Object.values(questions).reduce((sum, q) => 
                    sum + Object.values(q).reduce((s, count) => s + count, 0), 0
                  );

                  return (
                    <tr key={`${age}-${place}`} style={{ background: totalResponses > 0 ? 'var(--surface)' : 'var(--background)' }}>
                      <td style={{ padding: 'var(--spacing-sm)', border: '1px solid var(--border)', fontWeight: 500 }}>{age}</td>
                      <td style={{ padding: 'var(--spacing-sm)', border: '1px solid var(--border)' }}>{place}</td>
                      <td style={{ padding: 'var(--spacing-sm)', border: '1px solid var(--border)', fontWeight: 600 }}>
                        {totalResponses > 0 ? totalResponses : '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--text-light)' }}>
        <p>Analytics generated on {new Date().toLocaleString()} 🌸</p>
      </div>
    </div>
  );
}

export default AdminModule;
