

## Problem
Complex upgrade scenarios when:
- Balance covers difference
- Additional recharge needed

## Solution
```mermaid
stateDiagram
    [*] --> CheckBalance
    CheckBalance --> FullCoverage: Balance ≥ Difference
    CheckBalance --> PartialCoverage: Balance < Difference
    FullCoverage --> ProcessUpgrade
    PartialCoverage --> RequestAdditionalPayment