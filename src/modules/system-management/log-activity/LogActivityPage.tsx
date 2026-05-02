import React from "react";
import { ActivityLogDashboard } from "./components/ActivityLogDashboard";

export default function LogActivityPage() {
    return (
        <div className="flex flex-col gap-4 p-4 md:p-8">
            <ActivityLogDashboard />
        </div>
    );
}
