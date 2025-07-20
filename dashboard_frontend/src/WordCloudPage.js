import React, { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";
import cloud from "d3-cloud";
import "./WordCloudPage.css";

/**
 * PUBLIC_INTERFACE
 * Displays an interactive word cloud visualization extracted from app.json,
 * as a visually prominent dashboard widget matching the theme.
 */
function WordCloudPage() {
  const svgRef = useRef();
  const [appData, setAppData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  // Responsive width
  const width = 600, height = 400;

  // Data Fetch from static JSON
  useEffect(() => {
    fetch("./app.json")
      .then((resp) => {
        if (!resp.ok) throw new Error("Failed to load app.json");
        return resp.json();
      })
      .then((data) => {
        setAppData(Array.isArray(data) ? data : (Array.isArray(data.apps) ? data.apps : []));
        setLoading(false);
      })
      .catch((err) => {
        setError("Could not load word cloud data.");
        setLoading(false);
      });
  }, []);

  // Extract visible/meaningful keywords from app data for the cloud
  const words = useMemo(() => {
    if (!appData.length) return [];

    // Helper: flat string from an app
    const appText = (app) =>
      [
        app.app_name,
        app.feature_list,
        app.unique_features,
        app.third_party_integrations,
      ]
        .filter(Boolean)
        .map((s) => (typeof s === "string" ? s : ""))
        .join(" ")
        .replace(/[.,\-:;_\[\](){}|<>\/0-9'"\\n]/g, " ") // Remove most special chars/numbers
        .toLowerCase();

    // Choose all concatenated words for all apps
    let allText = appData.map(appText).join(" ");
    // Remove stop words for UX; could use common list, but build-in for simplicity
    const STOP_WORDS = new Set([
      "the","of","to","and","a","in","for","on","at","is","with","by","as","an","it","from",
      "or","be","this","that","are","was","can","has","will","not","but","if","use",
      "via","app","apps","feature","used","made","you","lets","have","all","api","page",
      "user","users","login","new","one","more","each","based","only","any","get","see"
    ]);
    // Flatten and count
    const freq = {};
    allText
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP_WORDS.has(w))
      .forEach((word) => {
        freq[word] = 1 + (freq[word] || 0);
      });
    // Only keep the top N words, scale nicely
    const sorted = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 60);
    // Provide a good scale
    return sorted.map(([word, count]) => ({
      text: word,
      size: 16 + Math.sqrt(count) * 18, // nonlinear size for aesthetics
      count,
    }));
  }, [appData]);

  // Word cloud rendering
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    if (words.length > 0) {
      cloud()
        .size([width, height])
        .words(words)
        .padding(7)
        .rotate(() => ~~(Math.random() * 2) * 90)
        .font("Impact")
        .fontSize((d) => d.size)
        .on("end", draw)
        .start();
    }

    function draw(wordsResult) {
      const g = svg
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

      g.selectAll("text")
        .data(wordsResult)
        .enter()
        .append("text")
        .style("font-size", (d) => d.size + "px")
        .style("font-family", "Impact")
        .style("fill", (d, i) =>
          d3.schemeCategory10[i % d3.schemeCategory10.length]
        )
        .attr("text-anchor", "middle")
        .attr("transform", (d) => `translate(${d.x},${d.y})rotate(${d.rotate})`)
        .style("cursor", "pointer")
        .on("mouseover", function (event, d) {
          d3.select(this).style("fill", "#1976D2").style("font-weight", "bold");
          // Tooltip (native title)
          d3.select(this).append("title").text(`Count: ${d.count}`);
        })
        .on("mouseout", function (event, d, nodes) {
          d3.select(this).style("fill", (d, i) => d3.schemeCategory10[i % d3.schemeCategory10.length])
            .style("font-weight", "normal");
          // Remove tooltip
          d3.select(this).select("title").remove();
        })
        .text((d) => d.text);
    }
  }, [words]);

  return (
    <div className="wordcloud-page">
      <div className="tabs">
        <button className="active">Word Cloud</button>
        <button style={{opacity:0.5, cursor:"not-allowed"}} disabled>
          Integrations
        </button>
        <button style={{opacity:0.5, cursor:"not-allowed"}} disabled>
          Features
        </button>
      </div>
      <div className="cloud-container">
        {loading ? (
          <span style={{ color: "#1976d2", fontWeight: 500 }}>Loading word cloud...</span>
        ) : error ? (
          <span style={{ color: "#b71c1c" }}>{error}</span>
        ) : words.length ? (
          <svg ref={svgRef} />
        ) : (
          <span style={{ color: "#89a", fontWeight: 450, fontSize: "1.1em" }}>
            No meaningful words found in app dataset.
          </span>
        )}
      </div>
      <div className="cloud-legend" style={{margin:"0 auto",marginTop:2,padding:"6px 17px 9px 17px"}}>
        <span>
          <b>Word size</b> = relative frequency of a keyword in all contest apps
        </span>
      </div>
    </div>
  );
}

export default WordCloudPage;
