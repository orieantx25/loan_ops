# **Product Requirements Document (PRD)**

# **Loan Operations Management Dashboard**

### **upGrad School of Technology (uGSOT)**

**Version:** 1.0  
**Prepared For:** Loan Operations Team, Admissions Team, Finance Team, Leadership  
**Prepared By:** Product & Operations  
**Platform:** Google Sheets (Formula Driven)  
**Theme:** upGrad School of Technology (Red, Black, White)

---

# **1\. Executive Summary**

The current Loan Tracker workbook has evolved into a central operational sheet but has become increasingly difficult to manage due to:

* Mixed raw data and reporting  
* Multiple manual calculations  
* Duplicate vendor counting  
* No standardized student journey  
* Difficult navigation  
* Lack of executive-level visibility  
* No drill-down capability  
* Poor scalability

The objective of this project is to redesign the workbook into a **fully formula-driven Loan Operations Management System** that automatically generates operational insights and executive dashboards while keeping the Master Data sheet untouched.

The dashboard should provide real-time visibility into every student's loan journey, vendor performance, duplicate applications, loan health, and operational bottlenecks.

---

# **2\. Business Objectives**

The dashboard should enable management to answer questions such as:

* How many students currently require loans?  
* How many have started the process?  
* Which vendors are performing best?  
* Which students have applied through multiple vendors?  
* What is the approval rate by vendor?  
* What is the disbursement conversion?  
* Which campuses require attention?  
* Which students are stuck?  
* Which reasons are causing drop-offs?  
* What is today's operational backlog?

---

# **3\. Goals**

## **Primary Goals**

✓ One source of truth

✓ Zero manual calculations

✓ Fully formula driven

✓ Executive-friendly dashboard

✓ Easy drill-down

✓ Automatic updates

✓ Vendor intelligence

✓ Student intelligence

✓ Operational monitoring

---

# **4\. Non Goals**

The project will NOT include

* Apps Script  
* External Database  
* Looker Studio  
* API Integrations  
* Manual Pivot Tables  
* Manual Refresh Buttons

Everything must work automatically using Google Sheet formulas.

---

# **5\. Existing Problems**

## **Problem 1**

Raw data and dashboard are mixed together.

Result

Very difficult to read.

---

## **Problem 2**

One student applying through three vendors is counted three times.

Example

Student A

Applied via

ICICI

Propelld

GyanDhan

Current Vendor Count

ICICI \= 1

Propelld \= 1

GyanDhan \= 1

Management assumes

3 Students

Reality

1 Student

---

## **Problem 3**

No Student Journey

Students are scattered across multiple statuses.

No way to know

Where students are stuck.

---

## **Problem 4**

No operational KPIs

No visibility into

Pending Docs

Need FLDG

Need Vidyalakshmi

Deferred

Rejected

Multiple Vendor Cases

---

## **Problem 5**

No executive dashboard

Leadership should understand workbook health within 30 seconds.

---

# **6\. Proposed Architecture**

Master Data  
(Raw Import Only)

        │

        ▼

Helper Columns  
(All Formula Driven)

        │

        ├───────────────┐  
        │               │  
        ▼               ▼

Student Summary     Vendor Summary

        │               │

        ▼               ▼

Stage Summary     Risk Summary

        │

        ▼

Dashboard

---

# **7\. Workbook Structure**

## **Sheet 1**

Master Data

Purpose

Raw imported data only

Rules

No formulas

No formatting

No totals

No merged cells

No calculations

Only imported records.

---

## **Sheet 2**

Configuration

Contains

Vendor Names

Loan Stages

Campus Names

Dropdown Values

Color Codes

Status Mapping

Reason Mapping

---

## **Sheet 3**

Helper Columns

This sheet becomes the processing engine.

Columns include

Student Key

Student Name

Campus

Course

Loan Required

Vendor Applied

Vendor Count

Duplicate Vendor Flag

Current Loan Stage

Final Loan Stage

Approval Status

Disbursement Status

Risk Category

Critical Flag

Pending Days

Primary Vendor

Current Owner

Application Date

Ageing Bucket

Latest Activity

Processing SLA

---

## **Sheet 4**

Student Analytics

One row

One student

Regardless of

How many vendors

How many applications

How many updates

This becomes

Student 360\.

---

## **Sheet 5**

Vendor Analytics

One row

One vendor

Metrics

Unique Students

Applications

Sanctioned

Rejected

Disbursed

Average Processing Time

Average Approval Rate

Average Disbursement %

Students Pending

Students Waiting

Students Escalated

---

## **Sheet 6**

Stage Analytics

Shows

Need Loan

Interested

Started

Documents Pending

Vendor Assigned

Processing

Approved

Rejected

Sanctioned

Disbursed

Closed

---

## **Sheet 7**

Dashboard

Executive dashboard

Only visualizations

No calculations

---

# **8\. Student Identification Logic**

Primary Key

Mobile Number

If unavailable

Use

Application ID

If unavailable

Use

Email

Every formula must identify

One unique student.

---

# **9\. Multiple Vendor Logic**

This is the biggest enhancement.

Instead of

Vendor Count

We create

Student Count

Application Count

Example

Student

Rahul

Applied

ICICI

Propelld

GyanDhan

Dashboard

Unique Students

1

Vendor Applications

3

Vendor Count

3

Average Vendors

3

Duplicate Flag

Yes

---

Vendor Summary

ICICI

Student Count

1

Applications

1

Propelld

Student Count

1

Applications

1

GyanDhan

Student Count

1

Applications

1

Management now understands

One student

Three applications

instead of

Three students.

---

# **10\. Student Journey**

Every student must belong to exactly one stage.

Need Loan

↓

Counselled

↓

Interested

↓

Loan Started

↓

Documents Pending

↓

Vendor Assigned

↓

Under Processing

↓

Approved

↓

Sanctioned

↓

Disbursed

↓

Completed

Dashboard Funnel

Automatically generated.

---

# **11\. Dashboard Layout**

---

## **Section A**

Executive KPI Cards

Cards

Total Students

Need Loan

Loan Started

Processing

Approved

Disbursed

Rejected

Pending Documents

Multiple Vendor Cases

Average Vendors

Need FLDG

Need Vidyalakshmi

Critical Cases

Average Processing Time

---

## **Section B**

Loan Funnel

Visual Funnel

Need Loan

↓

Started

↓

Processing

↓

Approved

↓

Disbursed

Shows

Drop-off

between stages.

---

## **Section C**

Vendor Performance

Cards

ICICI

Propelld

Vidyalakshmi

GyanDhan

Auxilo

InCred

Each card displays

Unique Students

Applications

Approval %

Disbursement %

Average TAT

Pending Cases

Rejected Cases

Critical Cases

---

## **Section D**

Campus Analysis

Campus-wise

Need Loan

Approved

Rejected

Disbursed

Pending

---

## **Section E**

Reason Analysis

Charts

Rejected Reasons

Pending Reasons

Student Drop Reasons

Income Reasons

Eligibility Reasons

Documentation Reasons

---

## **Section F**

Risk Dashboard

Need FLDG

Need Parent Docs

Need Income Proof

Need Signature

Need Vidyalakshmi

Need Reprocessing

Deferred

Refund

Critical Cases

---

## **Section G**

Vendor Overlap Matrix

Example

| Vendor | ICICI | Propelld | Auxilo |
| ----- | ----- | ----- | ----- |
| ICICI | \- | 18 | 9 |
| Propelld | 18 | \- | 6 |
| Auxilo | 9 | 6 | \- |

Shows

How many students

exist in multiple vendors.

---

## **Section H**

Ageing Dashboard

Buckets

0-3 Days

4-7 Days

8-15 Days

16-30 Days

30+ Days

Shows

Operational backlog.

---

## **Section I**

Top Pending Students

Shows

Student

Campus

Vendor

Pending Since

Current Stage

Owner

Days Pending

---

# **12\. Filters**

Global Dashboard Filters

Campus

Vendor

Course

Scholarship

Current Stage

Approval Status

Loan Status

Critical Flag

Duplicate Vendor

Need FLDG

Need Vidyalakshmi

Processing Bucket

Application Month

Admission Cycle

---

# **13\. Charts**

Use

KPI Cards

Progress Bars

Horizontal Bars

Stacked Bars

Heat Maps

Funnel Charts

Line Charts

Trend Charts

Minimal Donut Charts

Avoid

3D charts

Pie overload

Bright colours

---

# **14\. Design Guidelines**

Inspired by

upGrad School of Technology

Primary Color

\#E31C24

Black

\#111111

Dark Grey

\#2B2B2B

White

\#FFFFFF

Background

\#F6F6F6

Border

\#E5E5E5

Cards

Rounded

Minimal Shadow

Modern spacing

Bold KPIs

Minimal clutter

Typography

Clean

Executive

Premium

---

# **15\. Formula Requirements**

Everything should use formulas only.

Preferred Functions

ARRAYFORMULA

LET

MAP

SCAN

BYROW

FILTER

UNIQUE

SORT

QUERY

COUNTIFS

SUMIFS

TEXTJOIN

TEXTSPLIT

TOCOL

VSTACK

HSTACK

XLOOKUP

IFERROR

No manual updates.

---

# **16\. Performance Considerations**

The workbook should support:

* 50,000+ student records  
* Multiple admission cycles  
* Dynamic vendor additions  
* Daily data refreshes  
* Formula optimization to avoid recalculation bottlenecks  
* Minimal volatile functions  
* Helper tables instead of repeated calculations

---

# **17\. Success Metrics**

The solution will be considered successful if:

* 100% of KPIs are generated automatically  
* Duplicate student counting is eliminated  
* Vendor performance is measurable in real time  
* Dashboard updates instantly after Master Data changes  
* No manual calculations are required  
* Management can understand the health of loan operations within 30 seconds  
* Operations team can identify bottlenecks and critical cases within 2 minutes  
* Workbook remains performant and maintainable as data volume grows

---

# **18\. Future Enhancements (Phase 2\)**

* Automated email reminders for pending documents  
* SLA breach alerts  
* Daily operational summary  
* Campus-level scorecards  
* Vendor SLA benchmarking  
* Historical trend analysis by admission cycle  
* Predictive approval probability  
* Integration with CRM/LeadSquared  
* Looker Studio version of the dashboard  
* AI-powered insights highlighting bottlenecks and recommending actions

---

# **19\. Expected Outcome**

The redesigned workbook should function as a lightweight Business Intelligence (BI) system for loan operations. It will provide a single source of truth, eliminate duplicate counting, accurately distinguish unique students from vendor applications, and present real-time operational insights through an executive-grade dashboard. The result will be faster decision-making, improved vendor management, better tracking of student loan journeys, and significantly reduced manual effort while maintaining a fully formula-driven architecture.

