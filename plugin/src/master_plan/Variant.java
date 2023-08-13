package master_plan;

import com.vividsolutions.jump.feature.FeatureCollection;
import com.vividsolutions.jump.workbench.plugin.AbstractPlugIn;
import com.vividsolutions.jump.workbench.plugin.PlugInContext;
import com.vividsolutions.jump.workbench.ui.MultiInputDialog;
import com.vividsolutions.jump.workbench.ui.plugin.FeatureInstaller;

import java.sql.SQLException;
import java.util.List;

public class Variant extends AbstractPlugIn {

    public Variant() throws SQLException {
    }

    @Override
    public void initialize(PlugInContext context) throws Exception {
        FeatureInstaller featureInstaller = FeatureInstaller.getInstance(context.getWorkbenchContext()); // OpenJUMP >= 2.0
        featureInstaller.addMainMenuPlugin(
                this, //exe
                new String[]{"Master Plan", "Show Data"},
                this.getName(),
                false,
                null,
                null);
    }

    @Override
    public boolean execute(PlugInContext context) throws Exception {

        Database db = new Database();

        MultiInputDialog mid = new MultiInputDialog(
                context.getWorkbenchFrame(),
                this.getName(), true
        );

        List<String> variantsIDs = db.getVariantIDs();
        String _variantID = "Choose the variant ID to process";

        mid.addComboBox(_variantID, variantsIDs.get(0), variantsIDs, "yes");
        mid.setVisible(true); // modal dialog
        if (!mid.wasOKPressed()) return false;

        String variantID = mid.getText(_variantID);

        FeatureCollection effectedVariant = db.getEffectedParticelleByVariant(variantID);
        context.getLayerManager().addLayer("Variant", "Effected Variant - " + variantID, effectedVariant);

        db.close();
        return false;
    }

    @Override
    public String getName() {
        return "Show Effected Areas";
    }
}