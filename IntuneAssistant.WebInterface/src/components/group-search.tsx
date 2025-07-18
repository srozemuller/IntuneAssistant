import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function GroupSearchCard({ groupId, setGroupId, fetchGroupInfo, loading }: {
    groupId: string;
    setGroupId: (value: string) => void;
    fetchGroupInfo: () => void;
    loading: boolean;
}) {
    return (
        <Card className="mb-8">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">Group Assignments</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex gap-4">
                    <Input
                        placeholder="Enter Group Name or ID"
                        value={groupId}
                        onChange={(e) => setGroupId(e.target.value)}
                        className="max-w-md"
                    />
                    <Button
                        onClick={fetchGroupInfo}
                        disabled={loading || !groupId}
                    >
                        Search Group
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

export default GroupSearchCard;