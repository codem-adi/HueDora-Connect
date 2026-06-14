import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { clientMasterApi } from '../services/endpoints';
import { trimString } from '../utils/trimInput';
import { ClientsPanel } from '../components/ClientsPanel';
import { Pagination } from '../components/Pagination';
import { DEFAULT_PAGE_SIZE } from '../constants/pagination';
import { openProgramDocument } from '../utils/programDocument';

function formatAmount(value) {
  if (value == null || value === '') return '—';
  return Number(value).toLocaleString('en-IN');
}

export default function ClientMastersPage() {
  const [activeTab, setActiveTab] = useState('programs');
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadRecords(nextPage = page, nextPageSize = pageSize) {
    setLoading(true);
    const trimmedSearch = trimString(search);
    setSearch(trimmedSearch);
    try {
      const params = { page: nextPage, limit: nextPageSize };
      if (trimmedSearch) params.search = trimmedSearch;
      const { data } = await clientMasterApi.list(params);
      setRecords(data.data);
      setPagination(data.pagination);
      setPage(nextPage);
      setPageSize(nextPageSize);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load client master records');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (activeTab === 'programs') {
      loadRecords(1);
    }
  }, [activeTab]);

  async function handleDelete(id) {
    if (!window.confirm('Archive this client master record?')) return;
    try {
      await clientMasterApi.remove(id);
      await loadRecords(page);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to archive record');
    }
  }

  function handleSearch() {
    setPage(1);
    loadRecords(1, pageSize);
  }

  function handlePageChange(nextPage) {
    loadRecords(nextPage, pageSize);
  }

  function handlePageSizeChange(nextPageSize) {
    setPage(1);
    loadRecords(1, nextPageSize);
  }

  async function handlePreviewDocument(recordId) {
    try {
      await openProgramDocument(recordId);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to open program document');
    }
  }

  return (
    <div>
      <div className="toolbar" style={{ marginBottom: '1rem' }}>
        <button
          type="button"
          className={`btn ${activeTab === 'programs' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('programs')}
        >
          Program Configuration
        </button>
        <button
          type="button"
          className={`btn ${activeTab === 'clients' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('clients')}
        >
          Clients
        </button>
      </div>

      {activeTab === 'clients' ? (
        <ClientsPanel />
      ) : (
        <>
          <div className="toolbar">
            <div className="field field-grow">
              <label>
                Client name
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search by client name, program, camp..."
                />
              </label>
            </div>
            <button type="button" className="btn btn-secondary" onClick={handleSearch}>Search</button>
            <Link to="/client-masters/new" className="btn btn-primary">New Program Config</Link>
          </div>

          {error && <div className="error-banner">{error}</div>}

          <div className="table-card">
            {loading ? (
              <div className="empty-state">Loading client master records...</div>
            ) : records.length === 0 ? (
              <div className="empty-state">No client master records found.</div>
            ) : (
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Division / Business</th>
                      <th>Drug / Therapy</th>
                      <th>Camp Name</th>
                      <th>Service Model</th>
                      <th>HCW</th>
                      <th>PO Amount</th>
                      <th>Duration</th>
                      <th>SPOC</th>
                      <th>Request Timeline</th>
                      <th>Status</th>
                      <th>Document</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record) => (
                      <tr key={record._id}>
                        <td>{record.clientName}</td>
                        <td>{record.programName || '—'}</td>
                        <td>{record.drugTherapyName || '—'}</td>
                        <td>{record.campName || '—'}</td>
                        <td>{record.campType || '—'}</td>
                        <td>{record.healthcareWorker || '—'}</td>
                        <td>{formatAmount(record.poAmount)}</td>
                        <td>{record.campDuration || '—'}</td>
                        <td>
                          <div>{record.spocName || '—'}</div>
                          {record.spocNumber && <small className="meta-text">{record.spocNumber}</small>}
                        </td>
                        <td>{record.requestTimeline || '—'}</td>
                        <td>{record.isActive ? 'Active' : 'Inactive'}</td>
                        <td>
                          {record.programDocument?.storedName ? (
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => handlePreviewDocument(record._id)}
                            >
                              View PDF
                            </button>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td>
                          <div className="actions">
                            <Link to={`/client-masters/${record._id}/edit`} className="btn btn-secondary btn-sm">Edit</Link>
                            <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(record._id)}>
                              Archive
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <Pagination
            pagination={pagination}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            itemLabel="records"
          />
        </>
      )}
    </div>
  );
}
