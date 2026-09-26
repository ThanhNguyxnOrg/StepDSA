# sample_bubble_sort.py
# Developer's personal algorithm solution

def bubble_sort():
    arr = [45, 12, 89, 34, 7, 23, 60]
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr

if __name__ == "__main__":
    result = bubble_sort()
    print("Sorted array:", result)
