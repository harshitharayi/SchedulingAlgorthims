Live link : https://gregarious-pixie-e6d0e8.netlify.app/

#  **Scheduling Algorithms – A Visual Approach**

Efficient CPU scheduling is essential for seamless multitasking, ensuring optimal CPU utilization by determining which process runs and when. This project, offers an **interactive and dynamic** visualization of various scheduling algorithms to enhance comprehension of execution order, waiting time, and turnaround time.

---

## **Why CPU Scheduling?**
CPU scheduling plays a vital role in **maximizing system efficiency and resource utilization**. Different scheduling algorithms impact key performance metrics:
- **Waiting Time** – The duration a process remains in the queue before execution.
- **Turnaround Time** – The total time from process arrival to its completion.
-**Response Time** – The time taken for the first execution after arrival.

Optimized scheduling ensures fair CPU distribution, improves system throughput, and minimizes delays.

---

## **Implemented Scheduling Algorithms**
- **First Come First Serve (FCFS)** – A **non-preemptive** strategy where processes execute in arrival order.
- **Shortest Job First (SJF)** – Prioritizes processes with the **shortest burst time** to improve efficiency.
- **Round Robin (RR)** – **Time-sliced execution** ensures fairness among processes.
- **Priority Scheduling** – Executes processes based on **priority levels** rather than arrival time.

---

## **Visualizing CPU Scheduling**
This project provides **Gantt Chart-based real-time visualization**, enabling an intuitive understanding of process execution and CPU allocation.

### **Example: FCFS Algorithm Execution**

** Input:** 
![image](https://github.com/user-attachments/assets/0ec9d846-96f5-4565-be7d-0f1fd7b29b76)

** Visualization Process:** 
![image](https://github.com/user-attachments/assets/45ac42d7-61e2-4d06-839d-5e40ed9c5baf)

** Gantt Chart Representation:** 
![image](https://github.com/user-attachments/assets/d25843ab-0d43-4dfd-aab5-781e453f7e68)

** Output:** 
![image](https://github.com/user-attachments/assets/79384484-f0a4-4389-8205-7e06945e844c)

---

##  **Installation & Execution**
###  **Setup Instructions**
1. ** Clone the repository:**
   ```bash
   git clone https://github.com/your-username/scheduling-algo.git  
   cd scheduling-algo  
   ```
2. ** Run the visualization module:**
   ```bash
   npm run dev
   ```
3. ** Select a scheduling algorithm from the menu.**
4. ** Observe execution order and Gantt Chart visualization.**

---
