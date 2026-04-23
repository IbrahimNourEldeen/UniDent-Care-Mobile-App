import CaseDetailsScreen from "@/features/cases/screens/CaseDetails.Screen";
import { useLocalSearchParams } from "expo-router";

export default function CaseDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    return (
        <CaseDetailsScreen caseId={id as string} />
    );
}
