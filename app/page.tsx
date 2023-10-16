import RegistrationForm from "@/components/registration-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LightbulbIcon } from "lucide-react";

export default function Home() {
  return (
    <section className="w-full max-w-xl space-y-8">
      <div>
        <h1 className="text-xl font-bold mb-2">Registration Form</h1>
        <h1 className="text-sm text-muted-foreground mb-2">
          Please fill out everything below.
        </h1>
        <Card className="mt-8">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Before proceding</CardTitle>
            <LightbulbIcon className="h-6 w-6 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <p className="mt-2 text-sm text-muted-foreground text-align-justify">
              Make sure that you uploaded your CV and University/School
              verification of <b>ALL MEMBERS</b> to Google Drive and made it
              public.
            </p>
          </CardContent>
        </Card>
      </div>
      <RegistrationForm />
    </section>
  );
}
