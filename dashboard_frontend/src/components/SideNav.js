import React from "react";

// PUBLIC_INTERFACE
export function SideNav() {
  return (
    <nav className="sidenav-container" aria-label="Main Navigation">
      <span className="sidenav-logo">AppVote</span>
      <a className="sidenav-link active" href="#dashboard">
        Dashboard
      </a>
      <a className="sidenav-link" href="#top-apps">
        Top Apps
      </a>
      <a className="sidenav-link" href="#analytics">
        Analytics
      </a>
    </nav>
  );
}
