import RegistrationForm from "@/components/registration-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GlobeIcon, LightbulbIcon, MapPinnedIcon } from "lucide-react";

export default function Home() {
  return (
    <section className="w-full max-w-xl space-y-8">
      <div>
        <p className=" text-xl md:text-3xl font-medium text-center">
          Sorry for inconvenience, please proceed to the <a className="underline " href="https://forms.gle/XP2tu5mHKFq1Hb1TA">new registration form</a>.
        </p>
      </div>
      <div className="opacity-50">
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
            <p className="mt-2 text-sm text-muted-foreground text-align-justify">
              Please note that the candidates with documents that are outdated
              (dated earlier than September 2024) will be rejected.
            </p>
            <p className="mt-2 text-sm text-muted-foreground text-align-justify">
              Note: data is not saved upon reloading the page.
            </p>
          </CardContent>
        </Card>
      </div>          
        <Tabs defaultValue="offline" className=" opacity-50 pointer-events-none ">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="offline">
              <MapPinnedIcon className="w-4 h-4 mr-2" />
              Offline
            </TabsTrigger>
            <TabsTrigger value="online">
              <GlobeIcon className="w-4 h-4 mr-2" />
              Online
            </TabsTrigger>
          </TabsList>
          <TabsContent value="offline">
            <RegistrationForm online={false} />
          </TabsContent>
          <TabsContent value="online">
            <RegistrationForm online={true} />
          </TabsContent>
        </Tabs>
    </section>
  );
}
