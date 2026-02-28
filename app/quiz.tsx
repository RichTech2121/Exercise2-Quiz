import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { questions as initialQuestions } from "../questions";

type AnswerMap = Record<string, string | string[]>;

export default function Quiz() {
  const router = useRouter();

  // UI tabs
  const [activeTab, setActiveTab] = useState<"preview" | "settings">("preview");

  // Questions & answers state (editable in settings)
  const [questions, setQuestions] = useState<any[]>(initialQuestions);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({} as AnswerMap);

  // Timer settings
  const [timerSeconds, setTimerSeconds] = useState<number>(0); // total seconds set in settings
  const [remaining, setRemaining] = useState<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);

  const question = questions[current];

  const selectAnswer = (choice: string) => {
    setAnswers({ ...answers, [question.id]: choice });
  };

  const next = () => {
    if (current < questions.length - 1) {
      setCurrent(current + 1);
    } else {
      submit();
    }
  };

  const prev = () => {
    if (current > 0) setCurrent(current - 1);
  };

  const submit = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current as any);
      timerRef.current = null;
      setTimerRunning(false);
    }
    router.push({ pathname: "/result", params: { answers: JSON.stringify(answers) } });
  };

  // Timer effects
  useEffect(() => {
    if (!timerRunning) return;
    if (remaining <= 0) {
      // time's up
      submit();
      return;
    }

    timerRef.current = setInterval(() => {
      setRemaining((r) => r - 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current as any);
      timerRef.current = null;
    };
  }, [timerRunning]);

  useEffect(() => {
    if (remaining <= 0 && timerRunning) {
      submit();
    }
  }, [remaining]);

  const startTimer = () => {
    if (timerSeconds <= 0) {
      Alert.alert("No timer set", "Please set a timer in Quiz Settings first.");
      return;
    }
    setRemaining(timerSeconds);
    setTimerRunning(true);
  };

  // Settings: add / edit / delete
  const addQuestion = () => {
    const newQ = {
      id: Date.now(),
      type: "multiple",
      question: "New question",
      choices: { A: "Option 1", B: "Option 2", C: "Option 3", D: "Option 4" },
      answer: "A",
    };
    setQuestions([...questions, newQ]);
  };

  const deleteQuestion = (id: number) => {
    setQuestions(questions.filter((q) => q.id !== id));
    setCurrent((c) => Math.max(0, c - 1));
  };

  const updateQuestionField = (id: number, field: string, value: any) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, [field]: value } : q)));
  };

  // helpers for displaying time
  const fmt = (s: number) => {
    const mm = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const ss = (s % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "preview" && styles.activeTab]}
          onPress={() => setActiveTab("preview")}
        >
          <Text style={styles.tabText}>Preview Quiz</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "settings" && styles.activeTab]}
          onPress={() => setActiveTab("settings")}
        >
          <Text style={styles.tabText}>Quiz Settings</Text>
        </TouchableOpacity>
      </View>

      {activeTab === "preview" ? (
        <View style={{ flex: 1, width: "100%" }}>
          {timerSeconds > 0 && (
            <View style={styles.timerRow}>
              <Text>Timer: {fmt(remaining || timerSeconds)}</Text>
              {!timerRunning ? (
                <TouchableOpacity onPress={startTimer} style={styles.smallButton}>
                  <Text>Start</Text>
                </TouchableOpacity>
              ) : (
                <Text style={{ marginLeft: 12, color: "red" }}>Running</Text>
              )}
            </View>
          )}

          <ScrollView contentContainerStyle={{ padding: 20 }}>
            <Text style={styles.question}>
              {current + 1}. {question.question}
            </Text>

            {Object.entries(question.choices as Record<string, string>).map(([key, value]) => (
              <TouchableOpacity
                key={key}
                style={[styles.choice, answers[question.id] === key && styles.selected]}
                onPress={() => selectAnswer(key)}
              >
                <Text>
                  {key}. {value}
                </Text>
              </TouchableOpacity>
            ))}

            <View style={styles.nav}>
              <TouchableOpacity onPress={prev} disabled={current === 0}>
                <Text style={styles.navText}>Previous</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={next}>
                <Text style={styles.navText}>{current === questions.length - 1 ? "Finish" : "Next"}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <View style={{ marginBottom: 12, flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ fontSize: 18, fontWeight: "600" }}>Questions ({questions.length})</Text>
            <TouchableOpacity onPress={addQuestion} style={styles.smallButton}>
              <Text>Add</Text>
            </TouchableOpacity>
          </View>

          {questions.map((q) => (
            <View key={q.id} style={styles.settingCard}>
              <TextInput
                value={q.question}
                onChangeText={(t) => updateQuestionField(q.id, "question", t)}
                style={styles.input}
              />

              <Text style={{ marginTop: 6, fontSize: 12 }}>Choices (comma separated):</Text>
              <TextInput
                value={Object.values(q.choices).join(", ")}
                onChangeText={(t) => {
                  const parts = t.split(",").map((x) => x.trim());
                  const keys = Object.keys(q.choices);
                  const newChoices: any = {};
                  for (let i = 0; i < parts.length; i++) {
                    const key = keys[i] || String.fromCharCode(65 + i);
                    newChoices[key] = parts[i] || "";
                  }
                  updateQuestionField(q.id, "choices", newChoices);
                }}
                style={styles.input}
              />

              <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
                <TextInput
                  value={String(q.answer)}
                  onChangeText={(t) => updateQuestionField(q.id, "answer", t)}
                  style={[styles.input, { flex: 0.3 }]}
                />

                <View style={{ flexDirection: "row" }}>
                  <TouchableOpacity onPress={() => deleteQuestion(q.id)} style={styles.smallButton}>
                    <Text>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}

          <View style={{ marginTop: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: "600" }}>Timer (seconds)</Text>
            <TextInput
              keyboardType="numeric"
              value={String(timerSeconds)}
              onChangeText={(t) => setTimerSeconds(Number(t) || 0)}
              style={[styles.input, { width: 120 }]}
            />
            <Text style={{ marginTop: 8, color: "#555" }}>When the timer reaches 0, the quiz auto-submits.</Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 20, alignItems: "center" },
  tabs: { flexDirection: "row", width: "100%", justifyContent: "center", marginBottom: 8 },
  tab: { padding: 12, marginHorizontal: 8, borderRadius: 8, backgroundColor: "#eee" },
  activeTab: { backgroundColor: "#cfe3ff" },
  tabText: { fontWeight: "600" },
  question: { fontSize: 18, marginBottom: 20 },
  choice: { padding: 12, borderWidth: 1, borderRadius: 6, marginBottom: 10, width: "100%" },
  selected: { backgroundColor: "#d1e7dd" },
  nav: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  navText: { fontSize: 16, color: "blue" },
  input: { borderWidth: 1, padding: 8, borderRadius: 6, marginTop: 6 },
  settingCard: { padding: 12, borderWidth: 1, borderRadius: 8, marginBottom: 10 },
  smallButton: { backgroundColor: "#ddd", padding: 8, borderRadius: 6, marginLeft: 8 },
  timerRow: { flexDirection: "row", alignItems: "center", padding: 12, width: "100%", justifyContent: "space-between", paddingHorizontal: 20 },
});
