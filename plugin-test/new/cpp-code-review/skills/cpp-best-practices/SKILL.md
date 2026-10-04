---
name: cpp-best-practices
description: Core guidelines and coding standards for C++ development, memory management, and modern C++ idioms.
---

# Modern C++ Guidelines & Best Practices

Use this skill whenever reading, writing, or reviewing C++ code.

## 1. Resource Management & Memory Safety
- **Never use bare `new` or `delete`**: Prefer `std::make_unique` or `std::make_shared`.
- **RAII Everything**: Wrap resources (file handles, sockets, mutexes) in RAII classes.
- **Rule of Zero / Five**: Prefer classes with compiler-generated special member functions. If a class manually manages resources, implement constructor, destructor, copy constructor, move constructor, copy assignment, and move assignment.

## 2. Parameter Passing Guidelines
- Cheap to copy or move-only type by value: `void fn(int x)`, `void fn(std::unique_ptr<Widget> w)`
- Read-only string / contiguous data: `void fn(std::string_view s)`, `void fn(std::span<const int> v)`
- Read-only large object: `void fn(const BigObject& obj)`
- In-out parameter: `void fn(Widget& outWidget)`

## 3. Modern Type Safety & Expressiveness
- Prefer `enum class` over unscoped `enum`.
- Use `nullptr` instead of `NULL` or `0`.
- Mark non-mutating member functions as `const`.
- Mark overriding virtual functions with `override` (and `final` where applicable).
- Use `[[nodiscard]]` for functions where ignoring return values indicates a bug (e.g. allocation functions, error codes).
