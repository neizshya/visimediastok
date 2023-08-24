import { Card, Text } from "react-native-paper";
import { vw, vh, vmin, vmax } from "react-native-expo-viewport-units";
export default function CardHome(options) {
  return (
    <Card>
      <Card.Content style={{ alignItems: "center", justifyContent: "center" }}>
        <Text variant="titleSmall">{options.title}</Text>
      </Card.Content>
      <Card.Content
        style={{
          height: vh(12),
          alignItems: "center",
          justifyContent: "center",
        }}>
        <Text variant="titleLarge">{options.qty}</Text>
      </Card.Content>
    </Card>
  );
}
