import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setContent, addContent } from "../store/contentSlice";
import axios from "axios";
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Grid,
} from "@mui/material";
import config from "../config/config";

const Dashboard = () => {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("neutral");
  const [type, setType] = useState("blog");
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const dispatch = useDispatch();
  const { current } = useSelector((state) => state.content);
  const token = localStorage.getItem("token");

  const generateContent = async () => {
    setLoading(true);
    setGeneratedContent("");
    try {
      const response = await fetch(`${config.apiBaseUrl}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ topic, tone, type }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let content = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        content += chunk;
        setGeneratedContent((prev) => prev + chunk);
      }

      dispatch(setContent(content));
    } catch (error) {
      console.error("Generate error:", error.message);
      setGeneratedContent(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const saveContent = async () => {
    const title = `Draft-${Date.now()}`;
    await axios.post(`${config.apiBaseUrl}/api/save`, {
      token,
      title,
      text: generatedContent || current,
    });
    dispatch(
      addContent({ title, text: generatedContent || current, version: 1 })
    );
  };

  const parseContent = (content) => {
    if (!content || !content.trim()) return [];
    const lines = content.split("\n").filter((line) => line.trim());
    const sections = [];
    let currentSection = "";

    lines.forEach((line) => {
      if (line.startsWith("### ") || line.match(/^\d+\.\s/)) {
        if (currentSection) sections.push(currentSection.trim());
        currentSection = line;
      } else if (line.trim()) {
        currentSection += "\n" + line;
      }
    });

    if (currentSection) sections.push(currentSection.trim());

    return sections.map((section, index) => ({
      id: index,
      text: section,
      isHeading: section.startsWith("### "),
      isListItem: section.match(/^\d+\.\s/),
    }));
  };

  const contentSections = parseContent(generatedContent || current || "");

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Grid container spacing={2}>
        {/* Left: Form */}
        {/* <Grid item xs={12} md={4}> */}
        <Card elevation={1} sx={{ borderRadius: 1, bgcolor: "#fff" }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Content Assistant
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label="Topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                fullWidth
                size="small"
              />
              <FormControl fullWidth size="small">
                <InputLabel>Tone</InputLabel>
                <Select
                  value={tone}
                  label="Tone"
                  onChange={(e) => setTone(e.target.value)}
                >
                  <MenuItem value="neutral">Neutral</MenuItem>
                  <MenuItem value="casual">Casual</MenuItem>
                  <MenuItem value="formal">Formal</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select
                  value={type}
                  label="Type"
                  onChange={(e) => setType(e.target.value)}
                >
                  <MenuItem value="blog">Blog</MenuItem>
                  <MenuItem value="tweet">Tweet</MenuItem>
                  <MenuItem value="ad">Ad Copy</MenuItem>
                </Select>
              </FormControl>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={generateContent}
                  disabled={loading}
                >
                  {loading ? "Generating..." : "Generate"}
                </Button>
                <Button variant="outlined" fullWidth onClick={saveContent}>
                  Save
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
        {/* </Grid> */}

        {/* Right: Generated Content */}
        <Grid item md={8}>
          {/* <Card elevation={1} sx={{ borderRadius: 1, bgcolor: "#fff" }}> */}
          {/* <CardContent> */}
          <Typography variant="h6" gutterBottom>
            Generated Content
          </Typography>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress />
            </Box>
          ) : contentSections.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Generated content will appear here.
            </Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {contentSections.map((section) => (
                <Box
                  key={section.id}
                  sx={{
                    p: 2,
                    bgcolor: "#f5f5f5",
                    borderRadius: 1,
                    overflowWrap: "break-word",
                  }}
                >
                  {section.isHeading ? (
                    <Typography variant="subtitle1" fontWeight="bold">
                      {section.text.replace("### ", "")}
                    </Typography>
                  ) : section.isListItem ? (
                    <ul style={{ paddingLeft: "20px", margin: 0 }}>
                      <li>{section.text.replace(/^\d+\.\s/, "")}</li>
                    </ul>
                  ) : (
                    <Typography variant="body2">{section.text}</Typography>
                  )}
                </Box>
              ))}
            </Box>
          )}
          {/* </CardContent> */}
          {/* </Card> */}
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
