'use client';

import React, { useState,  useRef, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {RefreshCw, ChevronDown, Filter, Search, X, GitCompare, ArrowLeftRight, Settings, Download} from 'lucide-react';
import { CONFIGURATION_POLICIES_ENDPOINT, COMPARE_ENDPOINT } from '@/lib/constants';
import { apiScope } from '@/lib/msalConfig';
import { useApiRequest } from '@/hooks/useApiRequest';

interface ApiResponse {
    status: string;
    message: string;
    details: unknown[];
    data: Policy[] | { url: string; message: string }; // Updated to handle both cases
}

interface Policy {
    id: string;
    name: string;
    policyType: string;
}

interface ChildSetting {
    name: string;
    value: string;
    sourceValue: string;
    targetValue: string;
}

interface ComparisonResult {
    name: string;
    id: string;
    definitionId: string;
    values: {
        sourceValue: string;
        checkedValue: string;
    };
    description: string;
    keywords: string[];
    differences: string | null;
    settingCheckState: 'InSource' | 'InChecked' | 'InBothTheSame' | 'InBothDifferent';
    childSettings: ChildSetting[];
}

interface ComparisonResponse {
    status: string;
    results: {
        sourcePolicyId: string;
        sourcePolicyName: string;
        checkedPolicyId: string;
        checkedPolicyName: string;
        checkResults: ComparisonResult[];
    };
}

interface SearchableSelectProps {
    value: string;
    onSelect: (policy: Policy | null) => void;
    options: Policy[];
    placeholder: string;
    disabled?: boolean;
    label: string;
}

export default function PolicyComparison() {
    const { instance, accounts } = useMsal();
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [sourcePolicy, setSourcePolicy] = useState<Policy | null>(null);
    const [targetPolicy, setTargetPolicy] = useState<Policy | null>(null);
    const [comparisonResult, setComparisonResult] = useState<ComparisonResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [compareLoading, setCompareLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);

    const { request, cancel } = useApiRequest();

    const fetchPolicies = async () => {
        if (!accounts.length) return;

        setLoading(true);
        setError(null);

        try {
            const response = await request<ApiResponse>(CONFIGURATION_POLICIES_ENDPOINT);

            if (!response) {
                throw new Error('No response received from API');
            }

            // Handle the response data properly
            if (Array.isArray(response)) {
                // Direct array response
                setPolicies(response);
            } else if (response.data) {
                // Response with data field
                if (Array.isArray(response.data)) {
                    setPolicies(response.data);
                } else {
                    // data is { url: string; message: string }
                    throw new Error(response.data.message || 'Failed to fetch policies');
                }
            } else {
                throw new Error('Invalid response format');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch policies');
            console.error('Error fetching policies:', err);
        } finally {
            setLoading(false);
        }
    };


    const SearchableSelect: React.FC<SearchableSelectProps> = ({
                                                                   value,
                                                                   onSelect,
                                                                   options,
                                                                   placeholder,
                                                                   disabled,
                                                                   label
                                                               }) => {
        const [isOpen, setIsOpen] = useState(false);
        const [searchTerm, setSearchTerm] = useState('');
        const dropdownRef = useRef<HTMLDivElement>(null);
        const inputRef = useRef<HTMLInputElement>(null);

        const selectedPolicy = options.find(p => p.id === value);

        const filteredOptions = options.filter(policy =>
            policy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            policy.policyType.toLowerCase().includes(searchTerm.toLowerCase())
        );

        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                    setIsOpen(false);
                    setSearchTerm('');
                }
            };

            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }, []);

        useEffect(() => {
            if (isOpen && inputRef.current) {
                inputRef.current.focus();
            }
        }, [isOpen]);

        const handleSelect = (policy: Policy) => {
            onSelect(policy);
            setIsOpen(false);
            setSearchTerm('');
        };

        const handleClear = (e: React.MouseEvent) => {
            e.stopPropagation();
            onSelect(null);
        };

        return (
            <div className="relative" ref={dropdownRef}>
                <label className="block text-sm font-medium text-foreground mb-2">
                    {label}
                </label>
                <div
                    className={`w-full p-3 border border-border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer bg-background ${
                        disabled ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                >
                    <div className="flex items-center justify-between">
                <span className={selectedPolicy ? 'text-foreground' : 'text-muted-foreground'}>
                    {selectedPolicy ? selectedPolicy.name : placeholder}
                </span>
                        <div className="flex items-center gap-2">
                            {selectedPolicy && !disabled && (
                                <button
                                    onClick={handleClear}
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${
                                isOpen ? 'transform rotate-180' : ''
                            }`} />
                        </div>
                    </div>
                </div>

                {isOpen && !disabled && (
                    <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-hidden">
                        <div className="p-3 border-b border-border">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    placeholder="Search policies..."
                                    className="w-full pl-9 pr-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-background text-foreground"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                        </div>

                        <div className="max-h-48 overflow-y-auto">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((policy) => (
                                    <div
                                        key={policy.id}
                                        className="p-3 hover:bg-muted cursor-pointer border-b border-border last:border-b-0"
                                        onClick={() => handleSelect(policy)}
                                    >
                                        <div className="font-medium text-foreground text-sm">
                                            {policy.name}
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            Type: {policy.policyType}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-3 text-muted-foreground text-sm text-center">
                                    No policies found matching &quot;{searchTerm}&quot;
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );

    };




    const MultiSelectKeywords: React.FC<{
        availableKeywords: string[];
        selectedKeywords: string[];
        onSelectionChange: (keywords: string[]) => void;
    }> = ({ availableKeywords, selectedKeywords, onSelectionChange }) => {
        const [isOpen, setIsOpen] = useState(false);
        const [searchTerm, setSearchTerm] = useState('');
        const dropdownRef = useRef<HTMLDivElement>(null);

        const filteredKeywords = availableKeywords.filter(keyword =>
            keyword.toLowerCase().includes(searchTerm.toLowerCase())
        );

        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                    setIsOpen(false);
                    setSearchTerm('');
                }
            };

            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }, []);

        const toggleKeyword = (keyword: string) => {
            const newSelection = selectedKeywords.includes(keyword)
                ? selectedKeywords.filter(k => k !== keyword)
                : [...selectedKeywords, keyword];
            onSelectionChange(newSelection);
        };

        const clearAll = () => {
            onSelectionChange([]);
        };

        return (
            <div className="relative" ref={dropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filter by Keywords
                </label>
                <div
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer bg-white min-h-[42px]"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            {selectedKeywords.length === 0 ? (
                                <span className="text-gray-500">Select keywords...</span>
                            ) : (
                                <div className="flex flex-wrap gap-1">
                                    {selectedKeywords.slice(0, 2).map(keyword => (
                                        <Badge key={keyword} variant="secondary" className="text-xs">
                                            {keyword}
                                        </Badge>
                                    ))}
                                    {selectedKeywords.length > 2 && (
                                        <Badge variant="secondary" className="text-xs">
                                            +{selectedKeywords.length - 2} more
                                        </Badge>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {selectedKeywords.length > 0 && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        clearAll();
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${
                                isOpen ? 'transform rotate-180' : ''
                            }`} />
                        </div>
                    </div>
                </div>

                {isOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
                        <div className="p-3 border-b border-gray-200">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search keywords..."
                                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                        </div>

                        <div className="max-h-48 overflow-y-auto">
                            {filteredKeywords.length > 0 ? (
                                filteredKeywords.map((keyword) => (
                                    <div
                                        key={keyword}
                                        className="p-2 hover:bg-gray-50 cursor-pointer flex items-center gap-2"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleKeyword(keyword);
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedKeywords.includes(keyword)}
                                            onChange={() => {}}
                                            className="h-4 w-4 text-blue-600 rounded border-gray-300"
                                        />
                                        <span className="text-sm text-gray-900">{keyword}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="p-3 text-gray-500 text-sm text-center">
                                    No keywords found matching &quot;{searchTerm}&quot;
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const comparePolicies = async () => {
        if (!sourcePolicy || !targetPolicy || !accounts.length) return;

        setCompareLoading(true);
        setError(null);

        try {
            const data = await request<ComparisonResponse>(
                `${COMPARE_ENDPOINT}/${sourcePolicy.policyType}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        PolicyId: sourcePolicy.id,
                        ComparePolicyId: targetPolicy.id,
                    })
                }
            );

            if (!data) {
                throw new Error('No response received from comparison API');
            }

            setComparisonResult(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to compare policies');
            console.error('Error comparing policies:', err);
        } finally {
            setCompareLoading(false);
        }
    };

    const getAllKeywords = () => {
        if (!comparisonResult?.results?.checkResults) return [];

        const allKeywords = comparisonResult.results.checkResults
            .flatMap(result => result.keywords || [])
            .filter((keyword, index, array) => array.indexOf(keyword) === index)
            .sort();

        return allKeywords;
    };


    const filteredResults = comparisonResult?.results?.checkResults?.filter((result: ComparisonResult) => {
        const matchesName = result.name.toLowerCase().includes(filter.toLowerCase());
        const matchesStatus = statusFilter === 'all' || result.settingCheckState === statusFilter;
        const matchesKeywords = selectedKeywords.length === 0 ||
            selectedKeywords.some(keyword => result.keywords?.some(k => k.toLowerCase().includes(keyword.toLowerCase())));
        return matchesName && matchesStatus && matchesKeywords;
    }) || [];

    const getStatusBadge = (status: string) => {
        const badges = {
            'InBothTheSame': { color: 'bg-green-500 hover:bg-green-600', text: 'Same' },
            'InBothDifferent': { color: 'bg-red-500 hover:bg-red-600', text: 'Different' },
            'InSource': { color: 'bg-blue-500 hover:bg-blue-600', text: 'Source Only' },
            'InChecked': { color: 'bg-yellow-500 hover:bg-yellow-600', text: 'Target Only' },
        };
        const badge = badges[status as keyof typeof badges] || { color: 'bg-gray-500', text: status };
        return (
            <Badge variant="default" className={`text-xs whitespace-nowrap ${badge.color}`}>
                {badge.text}
            </Badge>
        );
    };

    const clearFilter = () => {
        setFilter('');
        setStatusFilter('all');
        setSelectedKeywords([]);
    };

    const clearSearch = () => {
        setFilter('');
    };

    const getFilteredStats = () => {
        if (!comparisonResult?.results?.checkResults) return null;

        const total = filteredResults.length;
        const same = filteredResults.filter(r => r.settingCheckState === 'InBothTheSame').length;
        const different = filteredResults.filter(r => r.settingCheckState === 'InBothDifferent').length;
        const sourceOnly = filteredResults.filter(r => r.settingCheckState === 'InSource').length;
        const targetOnly = filteredResults.filter(r => r.settingCheckState === 'InChecked').length;

        // Count child settings differences
        const totalChildSettings = filteredResults.reduce((acc, result) => acc + (result.childSettings?.length || 0), 0);
        const childDifferences = filteredResults.reduce((acc, result) => {
            return acc + (result.childSettings?.filter(child => child.sourceValue !== child.targetValue).length || 0);
        }, 0);

        return { total, same, different, sourceOnly, targetOnly, totalChildSettings, childDifferences };
    };


    const stats = getFilteredStats();

// Add these new functions after your existing functions and before the return statement

    const exportToHtml = () => {
        if (!comparisonResult?.results?.checkResults) return;

        const stats = getFilteredStats();
        const timestamp = new Date().toLocaleString();

        const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Policy Comparison Report - ${comparisonResult.results.sourcePolicyName} vs ${comparisonResult.results.checkedPolicyName}</title>
    <style>
        * { box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            text-align: center;
        }
        .header h1 { margin: 0 0 10px 0; font-size: 2.5rem; }
        .header p { margin: 0; opacity: 0.9; font-size: 1.1rem; }
        .stats-grid { 
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .stat-number { font-size: 2rem; font-weight: bold; margin-bottom: 5px; }
        .stat-label { color: #666; font-size: 0.9rem; }
        .same { color: #10b981; }
        .different { color: #ef4444; }
        .source-only { color: #3b82f6; }
        .target-only { color: #f59e0b; }
        .filters-section {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .filter-controls {
            display: grid;
            grid-template-columns: 1fr 200px 200px auto;
            gap: 15px;
            align-items: end;
            margin-bottom: 15px;
        }
        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: 500;
            color: #374151;
        }
        input, select {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 14px;
        }
        input:focus, select:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .btn {
            padding: 8px 16px;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
        }
        .btn:hover { background: #2563eb; }
        .btn-outline {
            background: transparent;
            color: #3b82f6;
            border: 1px solid #3b82f6;
        }
        .btn-outline:hover {
            background: #3b82f6;
            color: white;
        }
        .keyword-filter {
            position: relative;
        }
        .keyword-dropdown {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.15);
            max-height: 200px;
            overflow-y: auto;
            z-index: 1000;
            display: none;
        }
        .keyword-dropdown.open { display: block; }
        .keyword-option {
            padding: 8px 12px;
            cursor: pointer;
            border-bottom: 1px solid #f3f4f6;
        }
        .keyword-option:hover { background: #f3f4f6; }
        .keyword-option.selected { background: #dbeafe; color: #1d4ed8; }
        .selected-keywords {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
            margin-top: 10px;
        }
        .keyword-tag {
            background: #3b82f6;
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 12px;
            display: flex;
            align-items: center;
            gap: 4px;
        }
        .keyword-tag button {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            padding: 0;
            width: 16px;
            height: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .policies-header {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
        }
        .policy-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .policy-source { border-left: 4px solid #3b82f6; }
        .policy-target { border-left: 4px solid #10b981; }
        .policy-name { font-weight: bold; color: #1f2937; }
        .policy-label { font-size: 0.9rem; color: #6b7280; margin-bottom: 5px; }
        .setting-item {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 15px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .setting-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        .setting-name { font-weight: bold; font-size: 1.1rem; }
        .status-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 500;
            text-transform: uppercase;
        }
        .badge-same { background: #dcfce7; color: #166534; }
        .badge-different { background: #fecaca; color: #991b1b; }
        .badge-source { background: #dbeafe; color: #1e40af; }
        .badge-target { background: #fef3c7; color: #92400e; }
        .setting-description { color: #6b7280; margin-bottom: 15px; }
        .keywords {
            margin-bottom: 15px;
        }
        .keywords-label {
            font-size: 0.75rem;
            color: #6b7280;
            font-weight: 500;
            margin-bottom: 5px;
            text-transform: uppercase;
        }
        .keyword-list {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
        }
        .keyword {
            background: #f3f4f6;
            color: #374151;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.75rem;
            border: 1px solid #d1d5db;
        }
        .values-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 15px;
        }
        .value-card {
            padding: 15px;
            border-radius: 6px;
            border-left: 4px solid;
        }
        .value-source {
            background: #eff6ff;
            border-left-color: #3b82f6;
        }
        .value-target {
            background: #f0fdf4;
            border-left-color: #10b981;
        }
        .value-label {
            font-size: 0.75rem;
            font-weight: 500;
            text-transform: uppercase;
            margin-bottom: 5px;
        }
        .value-source .value-label { color: #1e40af; }
        .value-target .value-label { color: #065f46; }
        .value-text {
            font-size: 0.9rem;
            font-family: 'Monaco', 'Consolas', monospace;
        }
        .value-source .value-text { color: #1e3a8a; }
        .value-target .value-text { color: #064e3b; }
        .differences {
            background: #fffbeb;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 15px;
            margin-bottom: 15px;
        }
        .differences-label {
            font-size: 0.75rem;
            color: #92400e;
            font-weight: 500;
            text-transform: uppercase;
            margin-bottom: 5px;
        }
        .differences-text { color: #78350f; font-size: 0.9rem; }
        .child-settings {
            border-top: 1px solid #e5e7eb;
            padding-top: 15px;
            margin-top: 15px;
        }
        .child-settings-header {
            font-size: 0.9rem;
            font-weight: 500;
            color: #374151;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 5px;
        }
        .child-setting {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            padding: 12px;
            margin-bottom: 10px;
        }
        .child-setting.different {
            background: #fef2f2;
            border-color: #fca5a5;
        }
        .child-name {
            font-weight: 500;
            margin-bottom: 8px;
            font-size: 0.9rem;
        }
        .child-values {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
        }
        .child-value {
            padding: 8px;
            border-radius: 4px;
            font-size: 0.8rem;
            font-family: 'Monaco', 'Consolas', monospace;
        }
        .no-results {
            text-align: center;
            padding: 60px 20px;
            color: #6b7280;
            background: white;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .hidden { display: none !important; }
        @media (max-width: 768px) {
            .filter-controls {
                grid-template-columns: 1fr;
            }
            .values-grid, .child-values {
                grid-template-columns: 1fr;
            }
            .policies-header {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Policy Comparison Report</h1>
        <p>Generated on ${timestamp}</p>
    </div>

    <div class="stats-grid">
        <div class="stat-card">
            <div class="stat-number same">${stats?.same || 0}</div>
            <div class="stat-label">Identical Settings</div>
        </div>
        <div class="stat-card">
            <div class="stat-number different">${stats?.different || 0}</div>
            <div class="stat-label">Different Settings</div>
        </div>
        <div class="stat-card">
            <div class="stat-number source-only">${stats?.sourceOnly || 0}</div>
            <div class="stat-label">Source Only</div>
        </div>
        <div class="stat-card">
            <div class="stat-number target-only">${stats?.targetOnly || 0}</div>
            <div class="stat-label">Target Only</div>
        </div>
    </div>

    <div class="filters-section">
        <div class="filter-controls">
            <div class="form-group">
                <label for="searchInput">Search Settings</label>
                <input type="text" id="searchInput" placeholder="Search by setting name..." />
            </div>
            <div class="form-group">
                <label for="statusFilter">Status Filter</label>
                <select id="statusFilter">
                    <option value="all">All Settings</option>
                    <option value="InBothDifferent">Different Values</option>
                    <option value="InBothTheSame">Same Values</option>
                    <option value="InSource">Source Only</option>
                    <option value="InChecked">Target Only</option>
                </select>
            </div>
            <div class="form-group">
                <label for="keywordFilter">Keywords</label>
                <div class="keyword-filter">
                    <input type="text" id="keywordFilter" placeholder="Filter by keywords..." readonly onclick="toggleKeywordDropdown()" />
                    <div class="keyword-dropdown" id="keywordDropdown">
                        ${getAllKeywords().map(keyword => `
                            <div class="keyword-option" data-keyword="${keyword.replace(/"/g, '&quot;')}" onclick="toggleKeyword('${keyword.replace(/'/g, "\\'")}')">
                                ${keyword}
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="selected-keywords" id="selectedKeywords"></div>
            </div>
            <div>
                <button class="btn btn-outline" onclick="clearAllFilters()">Clear All</button>
            </div>
        </div>
    </div>

    <div class="policies-header">
        <div class="policy-card policy-source">
            <div class="policy-label">Source Policy</div>
            <div class="policy-name">${comparisonResult.results.sourcePolicyName}</div>
        </div>
        <div class="policy-card policy-target">
            <div class="policy-label">Target Policy</div>
            <div class="policy-name">${comparisonResult.results.checkedPolicyName}</div>
        </div>
    </div>

    <div id="settingsContainer">
        ${comparisonResult.results.checkResults.map((result: ComparisonResult) => {
            const badgeClass = {
                'InBothTheSame': 'badge-same',
                'InBothDifferent': 'badge-different',
                'InSource': 'badge-source',
                'InChecked': 'badge-target'
            }[result.settingCheckState] || 'badge-same';

            const badgeText = {
                'InBothTheSame': 'Same',
                'InBothDifferent': 'Different',
                'InSource': 'Source Only',
                'InChecked': 'Target Only'
            }[result.settingCheckState] || result.settingCheckState;

            return `
                <div class="setting-item" 
                     data-name="${result.name.toLowerCase()}"
                     data-status="${result.settingCheckState}"
                     data-keywords="${(result.keywords || []).join('|').toLowerCase()}">
                    <div class="setting-header">
                        <div class="setting-name">${result.name}</div>
                        <div class="status-badge ${badgeClass}">${badgeText}</div>
                    </div>
                    
                    <div class="setting-description">${result.description}</div>
                    
                    ${result.keywords && result.keywords.length > 0 ? `
                        <div class="keywords">
                            <div class="keywords-label">Keywords</div>
                            <div class="keyword-list">
                                ${result.keywords.map(keyword => `<span class="keyword">${keyword}</span>`).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="values-grid">
                        <div class="value-card value-source">
                            <div class="value-label">Source Value</div>
                            <div class="value-text">${result.values.sourceValue || '[Not Set]'}</div>
                        </div>
                        <div class="value-card value-target">
                            <div class="value-label">Target Value</div>
                            <div class="value-text">${result.values.checkedValue || '[Not Set]'}</div>
                        </div>
                    </div>
                    
                    ${result.differences && result.settingCheckState === 'InBothDifferent' ? `
                        <div class="differences">
                            <div class="differences-label">Differences Summary</div>
                            <div class="differences-text">${result.differences}</div>
                        </div>
                    ` : ''}
                    
                    ${result.childSettings && result.childSettings.length > 0 ? `
                        <div class="child-settings">
                            <div class="child-settings-header">
                                ⚙ Child Settings (${result.childSettings.length})
                            </div>
                            ${result.childSettings.map(child => {
                const isDifferent = child.sourceValue !== child.targetValue;
                return `
                                    <div class="child-setting ${isDifferent ? 'different' : ''}">
                                        <div class="child-name">${child.name}</div>
                                        <div class="child-values">
                                            <div class="child-value value-source">
                                                <strong>Source:</strong> ${child.sourceValue || '[Not Set]'}
                                            </div>
                                            <div class="child-value value-target">
                                                <strong>Target:</strong> ${child.targetValue || '[Not Set]'}
                                            </div>
                                        </div>
                                    </div>
                                `;
            }).join('')}
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('')}
    </div>

    <div class="no-results hidden" id="noResults">
        <h3>No settings match your current filters</h3>
        <p>Try adjusting your search criteria or clearing the filters.</p>
    </div>

    <script>
        let selectedKeywords = [];
        
        function toggleKeywordDropdown() {
            const dropdown = document.getElementById('keywordDropdown');
            dropdown.classList.toggle('open');
        }
        
        function toggleKeyword(keyword) {
            const index = selectedKeywords.indexOf(keyword);
            if (index > -1) {
                selectedKeywords.splice(index, 1);
            } else {
                selectedKeywords.push(keyword);
            }
            updateSelectedKeywords();
            updateKeywordDropdown();
            filterSettings();
        }
        
        function updateSelectedKeywords() {
            const container = document.getElementById('selectedKeywords');
            container.innerHTML = selectedKeywords.map(keyword => 
                \`<span class="keyword-tag">
                    \${keyword}
                    <button onclick="toggleKeyword('\${keyword.replace(/'/g, "\\\\'")}')">×</button>
                </span>\`
            ).join('');
        }
        
        function updateKeywordDropdown() {
            const options = document.querySelectorAll('.keyword-option');
            options.forEach(option => {
                const keyword = option.dataset.keyword;
                option.classList.toggle('selected', selectedKeywords.includes(keyword));
            });
        }
        
        function filterSettings() {
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();
            const statusFilter = document.getElementById('statusFilter').value;
            const settings = document.querySelectorAll('.setting-item');
            let visibleCount = 0;
            
            settings.forEach(setting => {
                const name = setting.dataset.name;
                const status = setting.dataset.status;
                const keywords = setting.dataset.keywords;
                
                const matchesSearch = !searchTerm || name.includes(searchTerm);
                const matchesStatus = statusFilter === 'all' || status === statusFilter;
                const matchesKeywords = selectedKeywords.length === 0 || 
                    selectedKeywords.some(keyword => keywords.includes(keyword.toLowerCase()));
                
                const isVisible = matchesSearch && matchesStatus && matchesKeywords;
                setting.classList.toggle('hidden', !isVisible);
                
                if (isVisible) visibleCount++;
            });
            
            document.getElementById('noResults').classList.toggle('hidden', visibleCount > 0);
        }
        
        function clearAllFilters() {
            document.getElementById('searchInput').value = '';
            document.getElementById('statusFilter').value = 'all';
            selectedKeywords = [];
            updateSelectedKeywords();
            updateKeywordDropdown();
            filterSettings();
        }
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(event) {
            const keywordFilter = document.querySelector('.keyword-filter');
            if (!keywordFilter.contains(event.target)) {
                document.getElementById('keywordDropdown').classList.remove('open');
            }
        });
        
        // Add event listeners
        document.getElementById('searchInput').addEventListener('input', filterSettings);
        document.getElementById('statusFilter').addEventListener('change', filterSettings);
    </script>
</body>
</html>
    `;

        // Create and download the HTML file
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `policy-comparison-${comparisonResult.results.sourcePolicyName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-vs-${comparisonResult.results.checkedPolicyName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${new Date().toISOString().split('T')[0]}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };



    return (
        <div className="p-4 lg:p-8 space-y-6 w-full max-w-none">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Policy Comparison</h1>
                    <p className="text-muted-foreground mt-2">
                        Compare configuration policies to identify differences and similarities
                    </p>
                </div>
                <div className="flex gap-2">
                    {policies.length > 0 ? (
                        <Button
                            onClick={fetchPolicies}
                            disabled={loading}
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    ) : (
                        <Button
                            onClick={fetchPolicies}
                            disabled={loading}
                            className="flex items-center gap-2"
                        >
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            Load Policies
                        </Button>
                    )}
                </div>
            </div>
            {/* Error Display */}
            {error && (
                <Card className="border-red-200">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2 text-red-600">
                            <X className="h-5 w-5" />
                            <span className="font-medium">Error:</span>
                            <span>{error}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                            Error occurred while fetching policies. Please try again.
                        </p>
                        <Button onClick={fetchPolicies} className="mt-4" variant="outline">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Show welcome card when no policies are loaded and not loading */}
            {policies.length === 0 && !loading && !error && (
                <Card className="shadow-sm">
                    <CardContent className="pt-6">
                        <div className="text-center py-12">
                            <div className="text-gray-400 mb-6">
                                <GitCompare className="h-16 w-16 mx-auto" />
                            </div>
                            <h3 className="text-xl font-medium text-foreground mb-4">
                                Ready to Compare Policies
                            </h3>
                            <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                Load your configuration policies to start comparing them and identify key differences across your organization.
                            </p>
                            <Button onClick={fetchPolicies} className="flex items-center gap-2 mx-auto" size="lg">
                                <GitCompare className="h-5 w-5" />
                                Load Policies
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Show loading state */}
            {loading && policies.length === 0 && (
                <Card className="shadow-sm">
                    <CardContent className="pt-6">
                        <div className="text-center py-16">
                            <RefreshCw className="h-12 w-12 mx-auto text-yellow-500 animate-spin mb-4" />
                            <h3 className="text-lg font-medium text-foreground mb-2">
                                Loading Policies
                            </h3>
                            <p className="text-gray-600">
                                Fetching configuration policies from your environment...
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Only show policy selection when policies are loaded */}
            {policies.length > 0 && (
                <>
                    {/* Policy Selection Section */}
                    <Card className="shadow-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5 text-gray-600" />
                                Select Policies to Compare (Warning: Currently only supports configuration setting catalog policies)
                            </CardTitle>
                            <CardDescription>
                                Choose two policies to compare their configurations and identify differences
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <SearchableSelect
                                    value={sourcePolicy?.id || ''}
                                    onSelect={setSourcePolicy}
                                    options={policies}
                                    placeholder="Select a source policy..."
                                    disabled={loading}
                                    label="Source Policy"
                                />

                                <SearchableSelect
                                    value={targetPolicy?.id || ''}
                                    onSelect={setTargetPolicy}
                                    options={policies}
                                    placeholder="Select a target policy..."
                                    disabled={loading}
                                    label="Target Policy"
                                />
                            </div>

                            <Button
                                onClick={comparePolicies}
                                disabled={!sourcePolicy || !targetPolicy || compareLoading || loading}
                                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
                            >
                                {compareLoading ? (
                                    <>
                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                        Comparing Policies...
                                    </>
                                ) : (
                                    <>
                                        <ArrowLeftRight className="h-4 w-4 mr-2" />
                                        Compare Policies
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    {error && (
                        <Card className="border-red-200 bg-red-50">
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-2 text-red-800">
                                    <X className="h-5 w-5" />
                                    <span className="font-medium">Error:</span>
                                    <span>{error}</span>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Comparison Results */}
                    {comparisonResult?.results?.checkResults && (
                        <>
                            {/* Search and Filter Section */}
                            <Card className="shadow-sm">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center gap-2">
                                        <Search className="h-5 w-5 text-gray-600" />
                                        Search Settings
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search by setting name..."
                                            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            value={filter}
                                            onChange={(e) => setFilter(e.target.value)}
                                        />
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        {filter && (
                                            <button
                                                onClick={clearSearch}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                <X className="h-5 w-5" />
                                            </button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Status Filter Section */}
                            <Card className="shadow-sm">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Filter className="h-5 w-5 text-gray-600" />
                                            Filters
                                        </div>
                                        {(statusFilter !== 'all' || filter || selectedKeywords.length > 0) && (
                                            <Button
                                                onClick={clearFilter}
                                                variant="outline"
                                                size="sm"
                                                className="flex items-center gap-1"
                                            >
                                                <X className="h-4 w-4" />
                                                Clear
                                            </Button>
                                        )}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Comparison Status
                                            </label>
                                            <select
                                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                value={statusFilter}
                                                onChange={(e) => setStatusFilter(e.target.value)}
                                            >
                                                <option value="all">All Settings</option>
                                                <option value="InBothDifferent">Different Values</option>
                                                <option value="InBothTheSame">Same Values</option>
                                                <option value="InSource">Source Only</option>
                                                <option value="InChecked">Target Only</option>
                                            </select>
                                        </div>

                                        <MultiSelectKeywords
                                            availableKeywords={getAllKeywords()}
                                            selectedKeywords={selectedKeywords}
                                            onSelectionChange={setSelectedKeywords}
                                        />
                                    </div>

                                    {/* Active Filters Display */}
                                    {(statusFilter !== 'all' || filter || selectedKeywords.length > 0) && (
                                        <div>
                                            <div className="text-sm font-medium text-gray-700 mb-2">Active Filters:</div>
                                            <div className="flex flex-wrap gap-2">
                                                {filter && (
                                                    <Badge variant="secondary" className="flex items-center gap-1">
                                                        Search: &quot;{filter}&quot;
                                                        <button onClick={() => setFilter('')} className="ml-1">
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </Badge>
                                                )}
                                                {statusFilter !== 'all' && (
                                                    <Badge variant="secondary" className="flex items-center gap-1">
                                                        Status: {statusFilter}
                                                        <button onClick={() => setStatusFilter('all')} className="ml-1">
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </Badge>
                                                )}
                                                {selectedKeywords.map(keyword => (
                                                    <Badge key={keyword} variant="secondary" className="flex items-center gap-1">
                                                        Keyword: {keyword}
                                                        <button
                                                            onClick={() => setSelectedKeywords(prev => prev.filter(k => k !== keyword))}
                                                            className="ml-1"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>


                            {/* Comparison Results Table */}
                            <Card className="shadow-sm w-full overflow-hidden">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <ArrowLeftRight className="h-5 w-5 text-gray-600" />
                                            Comparison Results
                                            {stats && <span className="text-sm text-gray-500">({stats.total} settings)</span>}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {stats && (
                                                <div className="flex flex-wrap gap-2 text-sm">
                                                    <Badge variant="default" className="bg-green-500 hover:bg-green-600">Same: {stats.same}</Badge>
                                                    <Badge variant="default" className="bg-red-500 hover:bg-red-600">Different: {stats.different}</Badge>
                                                    <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">Source Only: {stats.sourceOnly}</Badge>
                                                    <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600">Target Only: {stats.targetOnly}</Badge>
                                                </div>
                                            )}
                                            <Button
                                                onClick={exportToHtml}
                                                variant="outline"
                                                size="sm"
                                                className="flex items-center gap-2 whitespace-nowrap"
                                            >
                                                <Download className="h-4 w-4" />
                                                Export HTML
                                            </Button>
                                        </div>
                                    </CardTitle>
                                    <CardDescription>
                                        Detailed comparison between {comparisonResult.results?.sourcePolicyName} and {comparisonResult.results?.checkedPolicyName}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    {/* Policy Names Header */}
                                    <div className="sticky top-0 z-10 p-6 bg-white border-b shadow-sm">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                                                <h3 className="font-medium text-blue-900">Source Policy</h3>
                                                <p className="text-blue-700 text-sm">{comparisonResult.results?.sourcePolicyName}</p>
                                            </div>
                                            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                                                <h3 className="font-medium text-green-900">Target Policy</h3>
                                                <p className="text-green-700 text-sm">{comparisonResult.results?.checkedPolicyName}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Settings Comparison */}
                                    <div className="p-6 space-y-4">
                                        {filteredResults.length > 0 ? (
                                            filteredResults.map((result: ComparisonResult) => (
                                                <div key={result.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h3 className="font-medium text-gray-900">{result.name}</h3>
                                                        {getStatusBadge(result.settingCheckState)}
                                                    </div>

                                                    <p className="text-sm text-gray-600 mb-3">{result.description}</p>

                                                    {/* Keywords Display */}
                                                    {result.keywords && result.keywords.length > 0 && (
                                                        <div className="mb-4">
                                                            <div className="text-xs text-gray-500 font-medium mb-2">KEYWORDS</div>
                                                            <div className="flex flex-wrap gap-1">
                                                                {result.keywords.map((keyword, index) => (
                                                                    <Badge key={index} variant="outline" className="text-xs bg-neutral-300 hover:bg-neutral-400">
                                                                        {keyword}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Main setting values */}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                        <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                                                            <div className="text-xs text-blue-600 font-medium mb-1">SOURCE VALUE</div>
                                                            <div className="text-sm text-blue-900">
                                                                {result.values.sourceValue || '[Not Set]'}
                                                            </div>
                                                        </div>
                                                        <div className="bg-green-50 p-3 rounded border-l-4 border-green-400">
                                                            <div className="text-xs text-green-600 font-medium mb-1">TARGET VALUE</div>
                                                            <div className="text-sm text-green-900">
                                                                {result.values.checkedValue || '[Not Set]'}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Show differences if available */}
                                                    {result.differences && result.settingCheckState === 'InBothDifferent' && (
                                                        <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                                                            <div className="text-xs text-yellow-600 font-medium mb-1">DIFFERENCES SUMMARY</div>
                                                            <div className="text-sm text-yellow-900">{result.differences}</div>
                                                        </div>
                                                    )}

                                                    {/* Child Settings */}
                                                    {result.childSettings && result.childSettings.length > 0 && (
                                                        <div className="mt-4 border-t pt-4">
                                                            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                                                                <Settings className="h-4 w-4" />
                                                                Child Settings ({result.childSettings.length})
                                                            </h4>
                                                            <div className="space-y-3">
                                                                {result.childSettings.map((child, index) => {
                                                                    const isDifferent = child.sourceValue !== child.targetValue;

                                                                    return (
                                                                        <div key={index} className={`p-3 rounded-lg border ${
                                                                            isDifferent ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
                                                                        }`}>
                                                                            <div className="flex items-center justify-between mb-2">
                                                                                <span className="text-sm font-medium text-gray-700">{child.name}</span>
                                                                                {isDifferent && (
                                                                                    <Badge variant="destructive" className="text-xs">Different</Badge>
                                                                                )}
                                                                            </div>

                                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                                                                <div className={`p-2 rounded ${isDifferent ? 'bg-blue-100' : 'bg-white'}`}>
                                                                                    <div className="text-blue-600 font-medium mb-1">SOURCE</div>
                                                                                    <div className="text-blue-900">
                                                                                        {child.sourceValue || '[Not Set]'}
                                                                                    </div>
                                                                                </div>
                                                                                <div className={`p-2 rounded ${isDifferent ? 'bg-green-100' : 'bg-white'}`}>
                                                                                    <div className="text-green-600 font-medium mb-1">TARGET</div>
                                                                                    <div className="text-green-900">
                                                                                        {child.targetValue || '[Not Set]'}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8 text-gray-500">
                                                No settings match your current filters.
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </>
            )}
        </div>
    );
}
