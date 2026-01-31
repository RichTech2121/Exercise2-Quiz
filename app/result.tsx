
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { questions } from "../questions";

export default function Result() {
  const { answers } = useLocalSearchParams();
  const router = useRouter();
  const answerParam = Array.isArray(answers) ? answers[0] : (answers ?? "{}");
  const parsedAnswers = JSON.parse(answerParam) as Record<string, string | string[]>;
  const [highScore, setHighScore] = useState(0);

  const score = questions.reduce((total, q) => {
    return parsedAnswers[String(q.id)] === q.answer ? total + 1 : total;
  }, 0);

  useEffect(() => {
    if (score > highScore) setHighScore(score);
  }, [score, highScore]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quiz Completed 🎉</Text>
      <Text>Your Score: {score}</Text>
      <Text>Highest Score: {highScore}</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.replace("/")}
      >
        <Text style={styles.buttonText}>Restart Quiz</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, marginBottom: 20 },
  button: {
    marginTop: 20,
    backgroundColor: "#2196F3",
    padding: 12,
    borderRadius: 8,
  },
  buttonText: { color: "#fff" },
});
