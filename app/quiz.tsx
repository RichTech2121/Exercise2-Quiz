import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { questions } from "../questions";

export default function Quiz() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  type AnswerMap = Record<string, string | string[]>;
  const [answers, setAnswers] = useState<AnswerMap>({} as AnswerMap);

  const question = questions[current];

  const selectAnswer = (choice: string) => {
    setAnswers({ ...answers, [question.id]: choice });
  };

  const next = () => {
    if (current < questions.length - 1) {
      setCurrent(current + 1);
    } else {
      router.push({
        pathname: "/result",
        params: { answers: JSON.stringify(answers) },
      });
    }
  };

  const prev = () => {
    if (current > 0) setCurrent(current - 1);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.question}>
        {current + 1}. {question.question}
      </Text>

      {Object.entries(question.choices).map(([key, value]) => (
        <TouchableOpacity
          key={key}
          style={[
            styles.choice,
            answers[question.id] === key && styles.selected,
          ]}
          onPress={() => selectAnswer(key)}
        >
          <Text>{key}. {value}</Text>
        </TouchableOpacity>
      ))}

      <View style={styles.nav}>
        <TouchableOpacity onPress={prev} disabled={current === 0}>
          <Text style={styles.navText}>Previous</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={next}>
          <Text style={styles.navText}>
            {current === questions.length - 1 ? "Finish" : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  question: { fontSize: 18, marginBottom: 20 },
  choice: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 10,
  },
  selected: { backgroundColor: "#d1e7dd" },
  nav: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  navText: { fontSize: 16, color: "blue" },
});
