---
id: security-overview
title: Security & Compliance Overview
sidebar_label: Security Overview
description: Overview of the security, authentication, and compliance design of IntuneAssistant.
---

# IntuneAssistant – Security & Compliance Overview

:::info
This document provides the technical and security background of **IntuneAssistant** to support internal review, onboarding, and approval by security and compliance teams.
:::

---

## 🧭 Purpose

This page explains:

- How **IntuneAssistant** works and communicates with Microsoft Graph  
- Which **permissions** are required  
- How **authentication** and **authorization** are implemented  
- What **data** is stored and why  
- How tenants maintain **full control** over access and consent  

---

## Overview

**IntuneAssistant** is a management and automation platform for Microsoft Intune and Microsoft 365 environments.  
It simplifies administrative tasks, generates reports, and supports baseline comparison, documentation, and troubleshooting.

🔗 **Related documentation**
- [Authentication Overview](https://docs.intuneassistant.cloud/docs/general/authentication)
- [How It Works](https://docs.intuneassistant.cloud/docs/general/how-it-works)
- [Onboarding Flow](https://docs.intuneassistant.cloud/docs/onboarding)

---

## Architecture & Authentication Model

### Multi-Tier Design

IntuneAssistant uses **two multi-tenant Azure AD (Entra ID) applications**:

| Application | Purpose | Permissions |
|--------------|----------|--------------|
| **App 1 – Frontend** | Handles user login using OpenID Connect. | None (sign-in only) |
| **App 2 – Downstream API** | Communicates with Microsoft Graph API via the On-Behalf-Of (OBO) flow. | Delegated permissions listed below |

### Security Highlights

- No system accounts or application-only permissions.  
- All actions are **performed on behalf of the authenticated user**.  
- Tokens are **short-lived and delegated**.  
- Customer admins can **revoke access at any time** via Entra ID.

---

## Microsoft Graph Permissions

### Default Read Permissions

These are required for read-only modules (documentation, reporting, baseline comparison):

| Permission | Description |
|-------------|-------------|
| `DeviceManagementConfiguration.Read.All` | Read Intune configuration profiles and baselines |
| `DeviceManagementApps.Read.All` | Read managed applications |
| `DeviceManagementServiceConfig.Read.All` | Read device management service configuration |
| `DeviceManagementScripts.Read.All` | Read management scripts |
| `Group.Read.All` | Read group memberships |
| `Directory.AccessAsUser.All` | Access directory data on behalf of the user |
| `Policy.Read.ConditionalAccess` | Read Conditional Access policies |

---

### Partner Center (MSP) Scenarios

For **GDAP / Partner Center** integration, one additional scope is required:

| Permission | Description |
|-------------|-------------|
| `DelegatedAdminRelationship.Read.All` | Read Partner Center relationships to onboard customer tenants |

This permission is used **only** to identify and link Partner Center tenants during onboarding.

---

### Paid / Write Modules

Paid modules that modify Intune resources require **delegated write scopes**.  
These permissions are **requested only when activated** by the customer.

| Permission | Description |
|-------------|-------------|
| `DeviceManagementConfiguration.ReadWrite.All` | Modify configuration profiles |
| `DeviceManagementApps.ReadWrite.All` | Create or update applications |
| `DeviceManagementServiceConfig.ReadWrite.All` | Modify service configuration |
| `DeviceManagementScripts.ReadWrite.All` | Upload or edit scripts |
| `Group.ReadWrite.All` | Manage group memberships |

All actions remain fully **delegated** — performed under the signed-in user’s context.

---

## Data Storage & Privacy

| Data Type | Stored | Purpose | Retention |
|------------|---------|----------|-----------|
| **Tenant ID** | ✅ | Identify tenant and enforce fair-usage licensing | Persistent |
| **Tenant Domain** | ✅ | Display and licensing identification | Persistent |
| **Session Data (tokens, settings)** | ❌ | Stored only in the browser session | Temporary |
| **Intune / Graph Data** | ❌ | Processed in memory only, never persisted | N/A |

:::tip Minimal Data Policy
IntuneAssistant stores only the **tenant ID** and **domain**.  
No user data, device data, or configuration data is stored permanently.
:::

---

## Access Control & Governance

### Tenant Control

Tenant administrators can:

- Restrict access via **Enterprise Applications → Users & Groups**
- Control consent using **Admin Consent workflows**
- Use **Privileged Identity Management (PIM)** to grant time-bound access

### Role Enforcement

All actions are performed **under the user’s assigned Intune / Entra roles**.  
- Read-only roles → view data only  
- Administrator roles → perform allowed write actions  

No elevation or privilege escalation occurs within IntuneAssistant itself.

---

## Security Posture Summary

| Aspect | Details |
|---------|----------|
| **Authentication** | Microsoft Entra ID (OpenID Connect + OAuth 2.0 OBO) |
| **Authorization** | Delegated Microsoft Graph permissions |
| **Data Residency** | Minimal (tenant ID and domain only) |
| **Token Handling** | Short-lived, delegated, never stored |
| **Least Privilege** | Default to read-only |
| **Isolation** | Tenant-scoped sessions |
| **Multi-Tenant Safety** | Microsoft-compliant multi-tenant model |
| **GDAP Support** | Partner Center delegated rights only |
| **Auditability** | All actions appear under the signed-in user in audit logs |

---

## 🧾 Compliance Highlights

- ✅ **OAuth 2.0 / OpenID Connect compliant**
- ✅ **Uses only Microsoft Graph API**
- ✅ **No application-only access**
- ✅ **No data exfiltration**
- ✅ **Customer-controlled access & consent**
- ✅ **Revocable at any time** in Entra ID

---

## 🧠 Summary

**IntuneAssistant** follows Microsoft’s **Zero-Trust and Least-Privilege principles**:

- All authentication and authorization use **Microsoft Entra ID**.  
- All data access is **delegated** and **tenant-scoped**.  
- Only minimal metadata is stored.  
- Customers retain **complete control** over access, consent, and revocation.

IntuneAssistant provides enterprise-grade security while maintaining simplicity and transparency.

---

import DocCardList from '@theme/DocCardList';
import {useCurrentSidebarCategory} from '@docusaurus/theme-common';

## 📚 Continue Reading

<DocCardList items={useCurrentSidebarCategory().items}/>
