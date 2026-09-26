// sample_bubble_sort.cpp
// StepDSA Local Tracing Engine — C++ Example (ICPC / Competitive Programming)

#include <iostream>
#include <vector>
#include <utility>

void bubbleSort(std::vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n; ++i) {
        for (int j = 0; j < n - i - 1; ++j) {
            if (arr[j] > arr[j + 1]) {
                std::swap(arr[j], arr[j + 1]);
            }
        }
    }
}

int main() {
    std::vector<int> arr = {45, 12, 89, 34, 7, 23, 60};
    
    std::cout << "Original Array: ";
    for (int x : arr) std::cout << x << " ";
    std::cout << "\n";

    bubbleSort(arr);

    std::cout << "Sorted Array:   ";
    for (int x : arr) std::cout << x << " ";
    std::cout << "\n";

    return 0;
}
