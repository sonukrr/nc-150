// You are given an array of integers heights where heights[i] represents the height of a bar. The width of each bar is 1.
// Return the area of the largest rectangle that can be formed among the bars.

// Input: heights = [7,1,7,2,2,4]
// Output: 8

/*
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │              MIND MAP: Largest Rectangle in Histogram                   │
 * │                                                                         │
 * │                      CORE INSIGHT                                       │
 * │   Each bar[i] defines one possible rectangle:                           │
 * │   width = how far left & right it can extend before a shorter bar stops │
 * │   area  = heights[i] × width                                            │
 * │                                                                         │
 * │              ┌──────────────────────────────────┐                       │
 * │         BRUTE FORCE O(n²)              OPTIMAL O(n)                     │
 * │              │                                  │                       │
 * │   For each bar[i]:                  Precompute span boundaries          │
 * │   ├─ walk LEFT until                ├─ leftMost[i]  → nearest index     │
 * │   │    a shorter bar is found       │   with height STRICTLY < bar[i]   │
 * │   ├─ walk RIGHT until               ├─ rightMost[i] → nearest index     │
 * │   │    a shorter bar is found       │   with height STRICTLY < bar[i]   │
 * │   └─ width = r - l - 1             └─ width = rightMost[i]-leftMost[i]-1│
 * │      (l & r overshoot by 1 step)      area = heights[i] × width         │
 * │                                                                         │
 * │   MONOTONIC STACK (left pass, left → right):                            │
 * │   ├─ maintain indexes in strictly INCREASING height order               │
 * │   ├─ pop while stack-top height >= current → those can't be left bound  │
 * │   └─ remaining top is the nearest bar STRICTLY smaller = leftMost[i]    │
 * │                                                                         │
 * │   WHY pop on `<=` (not just `<`)?                                       │
 * │   └─ Equal-height bars must be cleared so each bar in a plateau         │
 * │      correctly inherits the full plateau width (not just half of it).   │
 * │                                                                         │
 * │   SENTINEL DEFAULTS:                                                    │
 * │   ├─ leftMost  filled with -1        ("wall" before index 0)            │
 * │   └─ rightMost filled with n         ("wall" after last index)          │
 * │      After lookup, +1 / -1 converts wall/index → actual span edge.      │
 * └─────────────────────────────────────────────────────────────────────────┘
 */


// BRUTE FORCE SOLUTION — O(n²) time, O(1) space
class Solution {
    /**
     * @param {number[]} heights
     * @return {number}
     */
    largestRectangleArea(heights) {
        let res = 0;

        for (let i = 0; i < heights.length; i++) {
            // walk left until we hit a bar shorter than heights[i]
            let l = i - 1;
            while (l >= 0 && heights[l] >= heights[i]) l--;

            // walk right until we hit a bar shorter than heights[i]
            let r = i + 1;
            while (r < heights.length && heights[r] >= heights[i]) r++;

            // l stopped one index BEFORE the left boundary,
            // r stopped one index AFTER the right boundary,
            // so actual width = r - l - 1  (cancel the two overshoots)
            res = Math.max(res, heights[i] * (r - l - 1));
        }

        return res;
    }
}


// OPTIMAL SOLUTION — O(n) time, O(n) space  (two monotonic-stack passes)
class Solution {
    /**
     * @param {number[]} heights
     * @return {number}
     */
    largestRectangleArea(heights) {
        const n = heights.length;

        // leftMost[i]  = index of the nearest bar to the LEFT  strictly shorter than bar[i]
        // rightMost[i] = index of the nearest bar to the RIGHT strictly shorter than bar[i]
        // Sentinels: -1 means "no boundary on the left", n means "no boundary on the right"
        const leftMost  = Array(n).fill(-1);
        const rightMost = Array(n).fill(n);

        const stack = [];

        // LEFT PASS — build leftMost using an increasing-height stack
        for (let i = 0; i < n; i++) {
            // pop bars that are >= heights[i]: they cannot be bar[i]'s left boundary.
            // using <= (not <) so equal-height bars are also cleared, letting each bar
            // in a plateau inherit the full plateau span rather than stopping at its neighbor.
            while (stack.length && heights[i] <= heights[stack[stack.length - 1]]) {
                stack.pop();
            }

            // whatever remains on top is the nearest strictly-smaller bar to the left
            if (stack.length) leftMost[i] = stack[stack.length - 1];

            stack.push(i);
        }

        stack.length = 0;

        // RIGHT PASS — mirror of left pass, scanning right → left
        for (let i = n - 1; i >= 0; i--) {
            while (stack.length && heights[i] <= heights[stack[stack.length - 1]]) {
                stack.pop();
            }

            if (stack.length) rightMost[i] = stack[stack.length - 1];

            stack.push(i);
        }

        let res = 0;
        for (let i = 0; i < n; i++) {
            // convert boundary indexes to the actual span edges:
            //   leftMost[i]  is one step OUTSIDE the span on the left  → +1 to step inside
            //   rightMost[i] is one step OUTSIDE the span on the right → -1 to step inside
            const left  = leftMost[i]  + 1;
            const right = rightMost[i] - 1;

            res = Math.max(res, heights[i] * (right - left + 1));
        }

        return res;
    }
}
