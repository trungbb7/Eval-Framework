# Flight Booking Architecture Specification

## 1. Introduction
This document outlines the system architecture for nationwide flight bookings.

## 2. Core Components
The system consists of Booking Service, Payment Gateway, and Notification Service.

## 3. Data Flow
When a customer clicks book, Booking Service receives the request and saves it into the database. Then it calls Payment Gateway to charge money.

## 4. Incident Management
If an incident occurs, open the logs to inspect and restart the service.
