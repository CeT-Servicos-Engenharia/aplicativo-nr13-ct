import { createStackNavigator } from "@react-navigation/stack";
import Login from "../src/pages/Login";
import Home from "../src/pages/Home";
import AppLayout from "../src/components/AppLayout";
import Projects from "../src/pages/Projects";
import RegisterClients from "../src/pages/RegisterClients";
import RegisterEngineer from "../src/pages/RegisterEngineer";
import RegisterAnalyst from "../src/pages/RegisterAnalyst";
import Equipment from "../src/pages/Equipment";
import Inspection from "../src/pages/Inspection";
import HydrostaticTest from "../src/pages/HydrostaticTest";
import ThicknessMeasurementMap from "../src/pages/ThicknessMeasurementMap";
import MedicalRecord from "../src/pages/MedicalRecord";
import ClientProjects from "../src/pages/ClientProjects";
import { useState } from "react";
import ClientsPage from "../src/pages/ClientsPage";
import EngenieersPage from "../src/pages/EngenieersPage";
import InspectorsPage from "../src/pages/InspectorsPage";

const Stack = createStackNavigator();

export function StackRoutes() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const LoginScreen = (props) => (
    <AppLayout>
      <Home {...props} />
    </AppLayout>
  );

  return (
    <Stack.Navigator>
      {!isAuthenticated ? (
        <Stack.Screen name="Login" options={{ headerShown: false }}>
          {(props) => (
            <Login {...props} setIsAuthenticated={setIsAuthenticated} />
          )}
        </Stack.Screen>
      ) : (
        <>
          <Stack.Screen name="Home" options={{ headerShown: false }}>
            {(props) => (
              <AppLayout>
                <Home {...props} />
              </AppLayout>
            )}
          </Stack.Screen>

          <Stack.Screen
            name="Projetos"
            component={Projects}
            options={{
              headerShown: true,
              headerTintColor: "#fff",
              headerStyle: {
                backgroundColor: "#1d4ed8",
              },
            }}
          />

          <Stack.Screen
            name="Cadastro de Cliente"
            component={RegisterClients}
            options={{
              headerShown: true,
              headerTintColor: "#fff",
              headerStyle: {
                backgroundColor: "#1d4ed8",
              },
            }}
          />

          <Stack.Screen
            name="Inspeções por Cliente"
            component={ClientProjects}
            options={{
              headerShown: true,
              headerTintColor: "#fff",
              headerStyle: {
                backgroundColor: "#1d4ed8",
              },
            }}
          />

          <Stack.Screen
            name="Cadastro de Engenheiro"
            component={RegisterEngineer}
            options={{
              headerShown: true,
              headerTintColor: "#fff",
              headerStyle: {
                backgroundColor: "#1d4ed8",
              },
            }}
          />

          <Stack.Screen
            name="Cadastro de Inspetor"
            component={RegisterAnalyst}
            options={{
              headerShown: true,
              headerTintColor: "#fff",
              headerStyle: {
                backgroundColor: "#1d4ed8",
              },
            }}
          />

          <Stack.Screen
            name="Equipamento"
            component={Equipment}
            options={{
              headerShown: true,
              headerTintColor: "#fff",
              headerStyle: {
                backgroundColor: "#1d4ed8",
              },
            }}
          />

          <Stack.Screen
            name="Inspeção"
            component={Inspection}
            options={{
              headerShown: true,
              headerTintColor: "#fff",
              headerStyle: {
                backgroundColor: "#1d4ed8",
              },
            }}
          />

          <Stack.Screen
            name="Teste Hidrostático"
            component={HydrostaticTest}
            options={{
              headerShown: true,
              headerTintColor: "#fff",
              headerStyle: {
                backgroundColor: "#1d4ed8",
              },
            }}
          />

          <Stack.Screen
            name="Mapa de medição de espessura"
            component={ThicknessMeasurementMap}
            options={{
              headerShown: true,
              headerTintColor: "#fff",
              headerStyle: {
                backgroundColor: "#1d4ed8",
              },
            }}
          />

          <Stack.Screen
            name="Criar Prontuário"
            component={MedicalRecord}
            options={{
              headerShown: true,
              headerTintColor: "#fff",
              headerStyle: {
                backgroundColor: "#1d4ed8",
              },
            }}
          />

          <Stack.Screen
            name="Clientes"
            component={ClientsPage}
            options={{
              headerShown: true,
              headerTintColor: "#fff",
              headerStyle: {
                backgroundColor: "#1d4ed8",
              },
            }}
          />

          <Stack.Screen
            name="Engenheiros"
            component={EngenieersPage}
            options={{
              headerShown: true,
              headerTintColor: "#fff",
              headerStyle: {
                backgroundColor: "#1d4ed8",
              },
            }}
          />

          <Stack.Screen
            name="Inspetores"
            component={InspectorsPage}
            options={{
              headerShown: true,
              headerTintColor: "#fff",
              headerStyle: {
                backgroundColor: "#1d4ed8",
              },
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
