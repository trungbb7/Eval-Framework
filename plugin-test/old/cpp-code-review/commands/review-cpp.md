---
description: Perform a comprehensive modern C++ code review focusing on safety, performance, and memory management.
---

# Modern C++ Code Review Command

Analyze the requested C++ files or current workspace directory and check for the following key areas:

## 1. Memory Safety & RAII

- Detect raw pointer ownership management (recommend `std::unique_ptr`, `std::shared_ptr`).
- Verify proper rule of 5 / rule of 0 implementation for classes managing resources.
- Check for buffer overflows, use-after-free, double-free, and dangling references.

## 2. Modern C++ Features (C++17 / C++20 / C++23)

- Use of `std::optional`, `std::variant`, `std::string_view`, and `std::span` over C-style concepts.
- Use `auto`, `const auto&`, and structured bindings where appropriate.
- Verify `constexpr` and `consteval` applicability for compile-time calculation.

## 3. Performance & Efficiency

- Unnecessary object copies (recommend pass by `const&` or move semantics).
- Inefficient container choices (e.g. `std::vector` vs `std::list`).
- Pass `std::string_view` for read-only string parameters.

## Instructions:

1. Scan changed files or files specified by the user.
2. Provide a summary of issues categorized by **Critical (Safety)**, **Warning (Performance)**, and **Suggestion (Modernization)**.
3. Show refactored code snippets for each suggestion.
