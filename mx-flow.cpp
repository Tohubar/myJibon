#include <bits/stdc++.h>
using namespace std;

bool bfs(vector<vector<long long>>& rG, int s, int t, int parent[]) {
    vector<bool> seen(t + 1, false);
    queue<int> q;
    q.push(s);
    seen[s] = true;
    parent[s] = -1;

    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (int v = s; v <= t; v++) {
            if (not seen[v] and rG[u][v] > 0) {
                q.push(v);
                parent[v] = u;
                seen[v] = true;
            }
        }
    }

    return seen[t];
}

long long max_flow(vector<vector<pair<int, int>>>& adj, int s, int t) {
    long long ans = 0;
    // int rG[t + 1][t + 1];
    vector<vector<long long>> rG(t + 1, vector<long long>(t + 1));
    for (int u = s; u <= t; u++) {
        for (auto v: adj[u]) {
            rG[u][v.first] = v.second;
        }
    }
    int parent[t + 1];
    while (bfs(rG, s, t, parent)) {
        long long path_flow = LLONG_MAX;

        for (int v = t; v != s; v = parent[v]) {
            int u = parent[v];
            path_flow = min(path_flow, rG[u][v]);
        }
        for (int v = t; v != s; v = parent[v]) {
            int u = parent[v];
            rG[u][v] -= path_flow;
            rG[v][u] += path_flow;
        }
        ans += path_flow;

    }
    return ans;
}

int main() {
    int n, m; cin >> n >> m;
    vector<vector<pair<int, int>>> adj(n + 1);
    while (m--) {
        int a, b, c; cin >> a >> b >> c;
        adj[a].push_back({b, c});
    }
    long long ans = max_flow(adj, 1, n);
    cout << ans;
}

// A C++ program to find maximal
// Bipartite matching.
#include <iostream>
#include <string.h>
using namespace std;

// M is number of applicants 
// and N is number of jobs
#define M 6
#define N 6

// A DFS based recursive function 
// that returns true if a matching
// for vertex u is possible
bool bpm(bool bpGraph[M][N], int u,
         bool seen[], int matchR[])
{
    // Try every job one by one
    for (int v = 0; v < N; v++)
    {
        // If applicant u is interested in 
        // job v and v is not visited
        if (bpGraph[u][v] && !seen[v])
        {
            // Mark v as visited
            seen[v] = true; 

            // If job 'v' is not assigned to an 
            // applicant OR previously assigned 
            // applicant for job v (which is matchR[v]) 
            // has an alternate job available. 
            // Since v is marked as visited in 
            // the above line, matchR[v] in the following 
            // recursive call will not get job 'v' again
            if (matchR[v] < 0 || bpm(bpGraph, matchR[v],
                                     seen, matchR))
            {
                matchR[v] = u;
                return true;
            }
        }
    }
    return false;
}

// Returns maximum number
// of matching from M to N
int maxBPM(bool bpGraph[M][N])
{
    // An array to keep track of the 
    // applicants assigned to jobs. 
    // The value of matchR[i] is the 
    // applicant number assigned to job i,
    // the value -1 indicates nobody is
    // assigned.
    int matchR[N];

    // Initially all jobs are available
    memset(matchR, -1, sizeof(matchR));

    // Count of jobs assigned to applicants
    int result = 0; 
    for (int u = 0; u < M; u++)
    {
        // Mark all jobs as not seen 
        // for next applicant.
        bool seen[N];
        memset(seen, 0, sizeof(seen));

        // Find if the applicant 'u' can get a job
        if (bpm(bpGraph, u, seen, matchR))
            result++;
    }
    return result;
}

// Driver Code
int main()
{
    // Let us create a bpGraph 
    // shown in the above example
    bool bpGraph[M][N] = {{0, 1, 1, 0, 0, 0},
                          {1, 0, 0, 1, 0, 0},
                          {0, 0, 1, 0, 0, 0},
                          {0, 0, 1, 1, 0, 0},
                          {0, 0, 0, 0, 0, 0},
                          {0, 0, 0, 0, 0, 1}};

    cout << "Maximum number of applicants that can get job is "
         << maxBPM(bpGraph);

    return 0;
}