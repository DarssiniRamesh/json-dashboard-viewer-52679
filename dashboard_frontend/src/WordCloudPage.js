import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import cloud from "d3-cloud";
import "./WordCloudPage.css";

/**
 * PUBLIC_INTERFACE
 * Displays a word cloud visualization of the most frequent words.
 * @param {Object[]} data - Array of objects representing words and counts. Ex: [{ word: 'a', count: 3 }]
 */
function WordCloudPage({ data }) {
  const svgRef = useRef();

  // Prepare and memoize words BEFORE any use, to avoid reference errors in hooks and render logic
  // Always initialize to a value, so no TDZ or re-declaration risk
  const words = React.useMemo(
    () =>
      Array.isArray(data)
        ? data.map((item) => ({
            text: item.word,
            size: item.count * 10 + 10, // Adjust size as needed
          }))
        : [],
    [data]
  );

  useEffect(() => {
    const svg = d3.select(svgRef.current);

    // Clear existing elements
    svg.selectAll("*").remove();

    // Only render word cloud if some words exist
    if (words.length > 0) {
      // Configure and start word cloud layout
      cloud()
        .size([600, 400])
        .words(words)
        .padding(5)
        .rotate(() => ~~(Math.random() * 2) * 90)
        .font("Impact")
        .fontSize((d) => d.size)
        .on("end", draw)
        .start();
    }

    // Draw function stays the same
    function draw(wordsResult) {
      svg
        .attr("width", 600)
        .attr("height", 400)
        .append("g")
        .attr("transform", `translate(${600 / 2},${400 / 2})`)
        .selectAll("text")
        .data(wordsResult)
        .enter()
        .append("text")
        .style("font-size", (d) => d.size + "px")
        .style("font-family", "Impact")
        .style("fill", () => d3.schemeCategory10[Math.floor(Math.random() * 10)])
        .attr("text-anchor", "middle")
        .attr("transform", (d) => `translate(${d.x},${d.y})rotate(${d.rotate})`)
        .text((d) => d.text);
    }
  }, [words]);

  return (
    <div className="wordcloud-container">
      {/* Container styling provided in WordCloudPage.css */}
      <h2>Word Cloud</h2>
      <svg ref={svgRef}></svg>
    </div>
  );
}

export default WordCloudPage;
