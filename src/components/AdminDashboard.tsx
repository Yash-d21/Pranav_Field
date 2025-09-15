import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { BarChart3, Download, Search, Filter, Eye, Calendar, Users, FileText, Database, RefreshCw } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import type { BaseRecord } from '../App';
import type { PhpApiService } from '../services/PhpApiService';

interface AdminDashboardProps {
  dataService: PhpApiService;
}

interface UnifiedRecord extends BaseRecord {
  [key: string]: any;
}

export function AdminDashboard({ dataService }: AdminDashboardProps) {
  const [records, setRecords] = useState<UnifiedRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<UnifiedRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<UnifiedRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(false);

  const activityTypes = [
    'Daily Punch-In',
    'Corrective Maintenance',
    'FRT Daily Activity - Preventive Maintenance',
    'Change Request',
    'GP Live Check',
    'Patroller Task & Observations'
  ];

  useEffect(() => {
    loadAllRecords();
    setupRealTimeListeners();
    
    // Cleanup listeners on unmount
    return () => {
      dataService.cleanup();
    };
  }, []);

  useEffect(() => {
    filterRecords();
  }, [records, searchTerm, filterType, dateFilter]);

  const loadAllRecords = async () => {
    setIsLoading(true);
    try {
      const allRecords = await dataService.getAllRecords();
      const unified: UnifiedRecord[] = [];

      // Process the records array directly
      if (Array.isArray(allRecords)) {
        unified.push(...allRecords.map(record => ({
          ...record,
          collection: record.activityType || 'Unknown',
          displayDate: new Date(record.timestamp || record.createdAt).toLocaleDateString(),
          displayTime: new Date(record.timestamp || record.createdAt).toLocaleTimeString()
        })));
      }

      // Sort by timestamp (newest first)
      unified.sort((a, b) => new Date(b.timestamp || b.createdAt).getTime() - new Date(a.timestamp || a.createdAt).getTime());
      
      setRecords(unified);
    } catch (error) {
      toast.error('Failed to load records');
      console.error('Load error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealTimeListeners = () => {
    // Real-time listeners not available with PHP/MySQL backend
    // Data will be refreshed manually or on page load
    console.log('Real-time listeners not available with PHP/MySQL backend');
    return () => {};
  };

  const exportToCSV = () => {
    if (filteredRecords.length === 0) {
      toast.error('No records to export');
      return;
    }

    const headers = [
      'ID',
      'Activity Type',
      'User Email',
      'Technician Name',
      'Location',
      'Priority',
      'Status',
      'Notes',
      'Created Date',
      'Created Time'
    ];

    const csvData = filteredRecords.map(record => [
      record.id || '',
      record.activityType || record.collection || '',
      record.user_email || '',
      record.technician_name || record.name || '',
      record.location || '',
      record.priority || '',
      record.status || '',
      record.notes || '',
      record.displayDate || '',
      record.displayTime || ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `field_maintenance_records_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('CSV file downloaded successfully');
  };

  const filterRecords = () => {
    let filtered = [...records];

    // Filter by activity type
    if (filterType !== 'all') {
      filtered = filtered.filter(record => record.activityType === filterType);
    }

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(record => 
        record.userEmail?.toLowerCase().includes(search) ||
        record.location?.toLowerCase().includes(search) ||
        record.mandalName?.toLowerCase().includes(search) ||
        record.ringName?.toLowerCase().includes(search) ||
        record.name?.toLowerCase().includes(search) ||
        record.gpName?.toLowerCase().includes(search) ||
        record.ttNumber?.toLowerCase().includes(search) ||
        record.changeRequestNo?.toLowerCase().includes(search)
      );
    }

    // Filter by date
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.timestamp || record.createdAt);
        return recordDate.toDateString() === filterDate.toDateString();
      });
    }

    setFilteredRecords(filtered);
  };

  const getStatistics = useMemo(() => {
    const stats = {
      total: records.length,
      today: 0,
      thisWeek: 0,
      thisMonth: 0,
      byType: {} as Record<string, number>
    };

    const now = new Date();
    const today = now.toDateString();
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    records.forEach(record => {
      const recordDate = new Date(record.timestamp || record.createdAt);
      
      // Count today's records
      if (recordDate.toDateString() === today) {
        stats.today++;
      }

      // Count this week's records
      if (recordDate >= weekStart) {
        stats.thisWeek++;
      }

      // Count this month's records
      if (recordDate >= monthStart) {
        stats.thisMonth++;
      }

      // Count by type
      if (!stats.byType[record.activityType]) {
        stats.byType[record.activityType] = 0;
      }
      stats.byType[record.activityType]++;
    });

    return stats;
  }, [records]);

  const exportToExcel = () => {
    try {
      // Create CSV content
      const headers = ['Timestamp', 'Activity Type', 'User Email', 'Location', 'Details'];
      const csvRows = [headers.join(',')];

      filteredRecords.forEach(record => {
        const details = getRecordDetails(record);
        const row = [
          `"${record.createdAt}"`,
          `"${record.activityType}"`,
          `"${record.userEmail}"`,
          `"${record.location || record.mandalName || 'N/A'}"`,
          `"${details}"`
        ];
        csvRows.push(row.join(','));
      });

      // Create and download file
      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `field_maintenance_report_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      toast.success('Report exported successfully');
    } catch (error) {
      toast.error('Failed to export report');
      console.error('Export error:', error);
    }
  };

  const getRecordDetails = (record: UnifiedRecord) => {
    switch (record.activityType) {
      case 'Daily Punch-In':
        return `Name: ${record.name}, Location: ${record.location}`;
      case 'Corrective Maintenance':
        return `TT: ${record.ttNumber}, Issue: ${record.issue?.substring(0, 50)}...`;
      case 'FRT Daily Activity - Preventive Maintenance':
        return `Ring: ${record.ringName}, GPs: ${record.noOfGPs}, Tests: ${record.fiberTests?.length || 0}`;
      case 'Change Request':
        return `CR: ${record.changeRequestNo}, OFC: ${record.materialConsumedOFC}m, Poles: ${record.materialConsumedPoles}`;
      case 'GP Live Check':
        return `GP: ${record.gpName}, Issues: ${getGPIssues(record)}`;
      case 'Patroller Task & Observations':
        return `Span: ${record.gpSpanName}, Activities: ${getPatrollerActivities(record)}`;
      default:
        return 'Details available in full view';
    }
  };

  const getGPIssues = (record: any) => {
    const issues = [];
    if (record.fdmsIssue) issues.push('FDMS');
    if (record.terminationIssue) issues.push('Termination');
    if (record.fiberIssue) issues.push('Fiber');
    return issues.length > 0 ? issues.join(', ') : 'None';
  };

  const getPatrollerActivities = (record: any) => {
    const activities = [];
    if (record.sagLocationIdentified) activities.push('SAG');
    if (record.clampDamaged) activities.push('Clamps');
    if (record.newPoleBendIdentified) activities.push('Poles');
    if (record.treeCuttingActivity) activities.push('Trees');
    return activities.length > 0 ? activities.join(', ') : 'None';
  };

  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case 'Daily Punch-In': return 'bg-blue-500';
      case 'Corrective Maintenance': return 'bg-red-500';
      case 'FRT Daily Activity - Preventive Maintenance': return 'bg-green-500';
      case 'Change Request': return 'bg-orange-500';
      case 'GP Live Check': return 'bg-purple-500';
      case 'Patroller Task & Observations': return 'bg-teal-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Database className="h-8 w-8 mx-auto mb-4 animate-spin" />
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CardHeader className="px-0 pb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-gray-600 rounded-lg p-2">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">Admin Dashboard</CardTitle>
            <p className="text-gray-600">Complete historical data viewing and analytics</p>
          </div>
        </div>
      </CardHeader>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 rounded-full p-2">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Records</p>
                <p className="text-2xl font-semibold">{getStatistics.total}</p>
                <p className="text-xs text-gray-500">All historical data</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 rounded-full p-2">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Today</p>
                <p className="text-2xl font-semibold">{getStatistics.today}</p>
                <p className="text-xs text-gray-500">Today's submissions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-100 rounded-full p-2">
                <Calendar className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">This Week</p>
                <p className="text-2xl font-semibold">{getStatistics.thisWeek}</p>
                <p className="text-xs text-gray-500">Week's submissions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-cyan-100 rounded-full p-2">
                <Calendar className="h-5 w-5 text-cyan-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-semibold">{getStatistics.thisMonth}</p>
                <p className="text-xs text-gray-500">Month's submissions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 rounded-full p-2">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-semibold">{new Set(records.map(r => r.userEmail)).size}</p>
                <p className="text-xs text-gray-500">Total unique users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-orange-100 rounded-full p-2">
                <Database className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Form Types</p>
                <p className="text-2xl font-semibold">{Object.keys(getStatistics.byType).length}</p>
                <p className="text-xs text-gray-500">Activity categories</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Type Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Submissions by Activity Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(getStatistics.byType).map(([type, count]) => (
              <div key={type} className="flex items-center space-x-3 p-3 border rounded-lg">
                <div className={`w-3 h-3 rounded-full ${getActivityTypeColor(type)}`}></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{type}</p>
                  <p className="text-xs text-gray-600">{count} submissions</p>
                </div>
                <Badge variant="outline">{count}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters and Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px] space-y-2">
              <Label htmlFor="search">Search Records</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by email, location, TT number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filter-type">Filter by Type</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All activity types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All activity types</SelectItem>
                  {activityTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date-filter">Filter by Date</Label>
              <Input
                id="date-filter"
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-[150px]"
              />
            </div>

            <Button onClick={exportToExcel} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Records Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <CardTitle className="text-base sm:text-lg">Historical Records ({filteredRecords.length})</CardTitle>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-blue-600 border-blue-600 text-xs">
                  All Time Data
                </Badge>
                {isRealTimeEnabled && (
                  <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                    Live Updates
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={loadAllRecords} variant="outline" size="sm" className="text-xs sm:text-sm">
                <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Refresh Data</span>
                <span className="sm:hidden">Refresh</span>
              </Button>
              <Button onClick={exportToCSV} variant="outline" size="sm" className="text-green-600 border-green-600 hover:bg-green-50 text-xs sm:text-sm">
                <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Export CSV</span>
                <span className="sm:hidden">Export</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs sm:text-sm">Date/Time</TableHead>
                  <TableHead className="text-xs sm:text-sm">Activity Type</TableHead>
                  <TableHead className="hidden sm:table-cell text-xs sm:text-sm">User</TableHead>
                  <TableHead className="text-xs sm:text-sm">Location</TableHead>
                  <TableHead className="hidden md:table-cell text-xs sm:text-sm">Details</TableHead>
                  <TableHead className="text-xs sm:text-sm">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-sm">
                      No records found matching your filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div className="text-xs sm:text-sm">
                          <div>{record.displayDate}</div>
                          <div className="text-gray-500 text-xs">{record.displayTime}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getActivityTypeColor(record.activityType)} text-white text-xs`}>
                          {record.activityType}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-xs sm:text-sm">{record.userEmail}</TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        {record.location || record.mandalName || 'N/A'}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-xs sm:text-sm max-w-[200px] truncate">
                        {getRecordDetails(record)}
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedRecord(record)}
                              className="text-xs"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              <span className="hidden sm:inline">View</span>
                              <span className="sm:hidden">👁</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>{selectedRecord?.activityType} Details</DialogTitle>
                            </DialogHeader>
                            {selectedRecord && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <Label>Timestamp</Label>
                                    <p className="text-sm">{selectedRecord.createdAt}</p>
                                  </div>
                                  <div>
                                    <Label>User Email</Label>
                                    <p className="text-sm">{selectedRecord.userEmail}</p>
                                  </div>
                                </div>
                                
                                <div className="border rounded-lg p-4">
                                  <h4 className="font-medium mb-3">Record Data</h4>
                                  <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto">
                                    {JSON.stringify(selectedRecord, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}